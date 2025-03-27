//@ts-nocheck
import mongoose from "mongoose";
import { User } from "../../models/userSchema.ts";
import { UserService } from "../../services/UserService.ts";

describe("UserService", () => {
  let userService: UserService;
  let mockUser;

  beforeEach(() => {
    userService = new UserService();

    // Create a mock user for testing
    mockUser = new User({
      _id: new mongoose.Types.ObjectId(),
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
    });
  });

  describe("getProfile", () => {
    it("should successfully retrieve user profile", async () => {
      // Mock mongoose findById method
      jest.spyOn(User, "findById").mockResolvedValue(mockUser);

      const result = await userService.getProfile(mockUser._id);

      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it("should throw error when user is not found", async () => {
      // Mock mongoose findById method to return null
      jest.spyOn(User, "findById").mockResolvedValue(null);

      await expect(userService.getProfile(mockUser._id)).rejects.toThrow(
        "User not found",
      );
    });

    it("should handle database errors", async () => {
      // Mock mongoose findById method to throw an error
      jest
        .spyOn(User, "findById")
        .mockRejectedValue(new Error("Database error"));

      await expect(userService.getProfile(mockUser._id)).rejects.toThrow(
        "Failed to fetch user profile",
      );
    });
  });

  describe("updateProfile", () => {
    it("should successfully update user profile", async () => {
      const updateData = { name: "Updated Name", phone: "0987654321" };

      // Create a mock updated user
      const updatedUser = { ...mockUser.toObject(), ...updateData };

      // Mock mongoose findByIdAndUpdate method
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(mockUser._id, updateData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { name: "Updated Name", phone: "0987654321" },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it("should exclude sensitive fields from update", async () => {
      const updateData = {
        name: "Updated Name",
        email: "newemail@example.com",
        password: "newpassword",
        role: "admin",
      };

      // Create a mock updated user
      const updatedUser = { ...mockUser.toObject(), name: "Updated Name" };

      // Mock mongoose findByIdAndUpdate method
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(mockUser._id, updateData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { name: "Updated Name" },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it("should throw error when user is not found during update", async () => {
      // Mock mongoose findByIdAndUpdate method to return null
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue(null);

      await expect(
        userService.updateProfile(mockUser._id, { name: "Updated Name" }),
      ).rejects.toThrow("User not found");
    });
  });
});
