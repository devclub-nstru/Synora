import { registerSchema, loginSchema, resendVerificationSchema } from "../schemas/auth.schema.js";
import { registerUser, verifyUserEmail, resendVerification, loginUser } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid registration data",
        errors: validation.error.issues,
      });
    }

    const { name, email, password } = validation.data;
    const user = await registerUser({ name, email, password });
    return res.status(201).json({message: "Registration successful. Please verify your email.", user});
  } catch (error) {
    if (error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({message: "User with this email already exists"});
    }

    console.error("Register controller error:", error);
    return res.status(500).json({message: "Internal server error"});
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({message: "Verification token is required"});
    }
    const result = await verifyUserEmail(token);

    return res.json(result);
  } catch (error) {
    if (error.message === "INVALID_VERIFICATION_TOKEN") {
      return res.status(400).json({message: "Invalid verification token"});
    }

    if (error.message === "VERIFICATION_TOKEN_EXPIRED") {
      return res.status(400).json({message: "Verification token has expired"});
    }

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({message: "User not found"});
    }

    if (error.message === "ALREADY_VERIFIED") {
      return res.status(400).json({message: "Email is already verified"});
    }

    console.error("Verify email controller error:", error);

    return res.status(500).json({message: "Internal server error"});
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const validation = resendVerificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid email",
        errors: validation.error.issues,
      });
    }

    const { email } = validation.data;
    const result = await resendVerification(email);

    return res.json(result);
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({message: "User not found"});
    }

    if (error.message === "ALREADY_VERIFIED") {
      return res.status(400).json({message: "Email is already verified"});
    }
    console.error("Resend verification controller error:", error);
    return res.status(500).json({message: "Internal server error"});
  }
};

export const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid login data",
        errors: validation.error.issues,
      });
    }

    const result = await loginUser(validation.data);

    return res.json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({message: "Invalid email or password"});
    }

    if (error.message === "EMAIL_NOT_VERIFIED") {
      return res.status(403).json({message: "Please verify your email before logging in"});
    }

    if (error.message === "ACCOUNT_INACTIVE") {
      return res.status(403).json({message: "Your account is inactive"});
    }

    console.error("Login controller error:", error);

    return res.status(500).json({message: "Internal server error"});
  }
};