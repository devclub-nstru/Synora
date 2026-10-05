import { Router } from "express";
import { register, verifyEmail, resendVerificationEmail, login } from "../controllers/auth.controller.js";
const router = Router();

// Register
router.post("/register", register);

// Verify email
router.get("/verify-email", verifyEmail);

// Resend verification email
router.post("/resend-verification", resendVerificationEmail);

// Login
router.post("/login", login);

export default router;
