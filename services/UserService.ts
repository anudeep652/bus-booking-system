//@ts-nocheck
import { User } from "../models/userSchema.ts";

export class UserService {
  async getProfile(userId) {
    try {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const { email, password, role, status, ...allowedUpdates } = updateData;

      const updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, {
        new: true,
      }).select("-password");

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }
}
