import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", {
    length: 150,
  }).notNull(),
  description: text("description"),
  projectLink: text("project_link"),
  category: varchar("category", {
    length: 100,
  }).notNull(),
  positions: integer("positions").notNull(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
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
