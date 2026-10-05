import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { db } from "@synora/db";
import { users, profiles, emailVerificationTokens } from "@synora/db/schema";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "../services/mail.service.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2. Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // 3. Check password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // 4. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 5. Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // 6. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 7. Create user
    const [user] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        isVerified: false,
        accountStatus: "active",
      })
      .returning();

    // 8. Create profile
    await db.insert(profiles).values({
      userId: user.id,
      name,
      achievements: [],
      socialLinks: {},
    });

    // 9. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 10. Token expires after 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // 11. Save verification token
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });

    // 12. Create verification URL
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    // 13. Send verification email
    await sendVerificationEmail({
      to: user.email,
      name,
      verificationUrl,
    });

    // 14. Send response
    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // 1. Check token exists
    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    // 2. Find verification token
    const verificationRecord = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .limit(1);

    if (verificationRecord.length === 0) {
      return res.status(400).json({
        message: "Invalid verification token",
      });
    }

    const record = verificationRecord[0];
    // 3. Check token expiry
    if (new Date() > record.expiresAt) {
      // Delete expired token
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, record.id));
      return res.status(400).json({
        message: "Verification token has expired",
      });
    }

    // 4. Verify user
    await db
      .update(users)
      .set({
        isVerified: true,

        updatedAt: new Date(),
      })
      .where(eq(users.id, record.userId));

    // 5. Delete used token
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, record.id));

    // 6. Response
    return res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// RESEND VERIFICATION EMAIL
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate email
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        isVerified: users.isVerified,
        name: profiles.name,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // 3. User not found
    if (result.length === 0) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const user = result[0];

    // 4. Already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // 5. Delete old tokens
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, user.id));

    // 6. Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // 7. Save new token
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token: verificationToken,
      expiresAt,
    });

    // 8. Create verification URL
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    // 9. Send email
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });

    // 10. Response
    return res.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Find user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // 4. User not found
    if (result.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result[0];

    // 5. Check account status
    if (user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Account is not active",
      });
    }

    // 6. Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    // 7. Compare password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 8. Generate JWT
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    );

    // 9. Send response
    return res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
