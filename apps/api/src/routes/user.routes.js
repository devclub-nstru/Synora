import { Router } from "express";
import { db } from "@synora/db";
import { users, profiles } from "@synora/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// GET CURRENT USER
router.get( "/me", requireAuth, async (req, res) => {
  try {
    const result = await db
      .select({
          id: users.id,
          email: users.email,
          isVerified: users.isVerified,
          accountStatus: users.accountStatus,
          name: profiles.name,
          imageUrl: profiles.imageUrl,
          bio: profiles.bio,
          achievements: profiles.achievements,
          socialLinks: profiles.socialLinks,
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.id, req.user.userId))
        .limit(1);

      // User not found
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Return user
      return res.json({
        user: result[0],
      });
    } catch (error) {
      console.error("Get current user error:", error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);

export default router;
