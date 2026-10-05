import { eq } from "drizzle-orm";
import { db } from "@synora/db";
import { users } from "@synora/db/schema";

export const getCurrentUser = async (userId) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
      bio: users.bio,
      achievements: users.achievements,
      socialLinks: users.socialLinks,
      isVerified: users.isVerified,
      accountStatus: users.accountStatus,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
};

export const updateCurrentUser = async (userId, updates) => {
  const [user] = await db
    .update(users)
    .set({...updates, updatedAt: new Date()})
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
      bio: users.bio,
      achievements: users.achievements,
      socialLinks: users.socialLinks,
      isVerified: users.isVerified,
      accountStatus: users.accountStatus,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return user || null;
};
