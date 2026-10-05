import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@synora/db";
import { users, profiles } from "@synora/db/schema";
import { sendVerificationEmail } from "../utils/mail.js";

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const [user] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      passwordHash,
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
      accountStatus: "active",
    })
    .returning({
      id: users.id,
      email: users.email,
      isVerified: users.isVerified,
    });

  await db.insert(profiles).values({
    userId: user.id,
    name,
  });

  const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`;

  await sendVerificationEmail({
    to: normalizedEmail,
    name,
    verificationUrl,
  });

  return user;
};

export const verifyUserEmail = async (token) => {
  const result = await db
    .select({
      id: users.id,
      isVerified: users.isVerified,
      verificationTokenExpiresAt: users.verificationTokenExpiresAt,
    })
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);

  if (result.length === 0) {
    throw new Error("INVALID_VERIFICATION_TOKEN");
  }

  const user = result[0];

  if (
    !user.verificationTokenExpiresAt ||
    user.verificationTokenExpiresAt < new Date()
  ) {
    throw new Error("VERIFICATION_TOKEN_EXPIRED");
  }

  await db
    .update(users)
    .set({
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return {
    message: "Email verified successfully",
  };
};

export const resendVerification = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

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

  if (result.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const user = result[0];

  if (user.isVerified) {
    throw new Error("ALREADY_VERIFIED");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const verificationTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await db
    .update(users)
    .set({
      verificationToken,
      verificationTokenExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`;

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });

  return {
    message: "Verification email sent successfully",
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      isVerified: users.isVerified,
      accountStatus: users.accountStatus,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (result.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result[0];

  if (user.accountStatus !== "active") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  if (!user.isVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

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

  return {
    accessToken,

    user: {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    },
  };
};
