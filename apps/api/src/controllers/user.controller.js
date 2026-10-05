import { updateUserSchema } from "../schemas/user.schema.js";

import { getCurrentUser, updateCurrentUser } from "../services/user.service.js";

export const getMe = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const validation = updateUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid user data",
        errors: validation.error.issues,
      });
    }
    const updates = validation.data;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "At least one field is required" });
    }

    const user = await updateCurrentUser(req.user.userId, updates);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({ message: "Internal server error" });
  }
};
