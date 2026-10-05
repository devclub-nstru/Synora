DROP TABLE "profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "achievements" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "social_links" jsonb DEFAULT '{}'::jsonb NOT NULL;