import { eq } from "drizzle-orm";
import { db } from "@synora/db";
import { users, profiles } from "@synora/db/schema";

export const getCurrentUser = async (userId) => {
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
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
};

export const updateCurrentUserProfile = async (userId, updates) => {
  const [updatedProfile] = await db
    .update(profiles)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId))
    .returning();

  return updatedProfile || null;
};
