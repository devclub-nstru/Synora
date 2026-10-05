import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the .env file from the monorepo root
dotenv.config({
  path: resolve(__dirname, "../../.env"),
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Check the root .env file.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
