import { updateProfileSchema } from "../schemas/profile.schema.js";
import {
  getCurrentUser,
  updateCurrentUserProfile,
} from "../services/user.service.js";
export const getMe = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid profile data",
        errors: validation.error.flatten(),
      });
    }
    const updates = validation.data;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "At least one field is required",
      });
    }

    const profile = await updateCurrentUserProfile(req.user.userId, updates);

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
