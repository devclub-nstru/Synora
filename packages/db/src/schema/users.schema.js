import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  imageUrl: text("image_url"),
  bio: text("bio"),
  achievements: jsonb("achievements").notNull().default([]),
  socialLinks: jsonb("social_links").notNull().default({}),
  isVerified: boolean("is_verified").notNull().default(false),
  accountStatus: varchar("account_status", { length: 30 })
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
