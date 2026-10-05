import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name must be at most 150 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  imageUrl: z.url("Image URL must be a valid URL").optional(),
  achievements: z.array(z.string()).optional(),
  socialLinks: z.record(z.string(), z.url()).optional(),
});
