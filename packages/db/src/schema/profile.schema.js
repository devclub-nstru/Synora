import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";
export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  name: varchar("name", {
    length: 150,
  }).notNull(),
  imageUrl: text("image_url"),
  bio: text("bio"),
  achievements: jsonb("achievements").notNull().default([]),
  socialLinks: jsonb("social_links").notNull().default({}),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});
