import { Router } from "express";
import { register, verifyEmail, resendVerificationEmail, login } from "../controllers/auth.controller.js";

const router = Router();
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/login", login);

export default router;
