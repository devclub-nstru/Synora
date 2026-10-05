import express from "express";
import { db } from "@synora/db";
import { sql } from "drizzle-orm";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
const app = express();

// MIDDLEWARE
app.use(express.json());

// ROOT
app.get("/", (req, res) => {
  res.json({
    message: "Synora API is running",
  });
});

// DATABASE HEALTH
app.get("/health/db", async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
      res.json({
        status: "ok",
        database: "connected",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        database: "disconnected",
      });
    }
  });

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// USER ROUTES
app.use("/api/users", userRoutes);

// SERVER
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Synora API running on port ${PORT}`);
});
