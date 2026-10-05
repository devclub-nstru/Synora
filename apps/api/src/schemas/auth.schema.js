import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const resendVerificationSchema = z.object({email: z.string().email(),});
