import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  bio: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  achievements: z.array(z.string()).optional(),
  socialLinks: z.record(z.string(), z.string().url()).optional(),
});
