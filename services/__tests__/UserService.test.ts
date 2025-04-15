// @ts-nocheck
import { UserService } from "../UserService";
import { User } from "../../models/userSchema";
import type { RequireAtLeastOne, User as TUser } from "../../types/index";

jest.mock("../../models/userSchema");

const MockedUser = User as jest.Mocked<typeof User>;

describe("UserService", () => {
  let userService: UserService;
  let mockFindById: jest.Mock;
  let mockFindByIdAndUpdate: jest.Mock;
  let mockSelect: jest.Mock;
  let mockFindByIdChain: { select: jest.Mock };
  let mockFindByIdAndUpdateChain: { select: jest.Mock };

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();

    mockSelect = jest.fn();
    mockFindById = jest.fn();
    mockFindByIdAndUpdate = jest.fn();

    mockFindByIdChain = { select: mockSelect };
    mockFindByIdAndUpdateChain = { select: mockSelect };

    mockFindById.mockReturnValue(mockFindByIdChain);
    mockFindByIdAndUpdate.mockReturnValue(mockFindByIdAndUpdateChain);

    MockedUser.findById = mockFindById;
    MockedUser.findByIdAndUpdate = mockFindByIdAndUpdate;
  });

  describe("getProfile", () => {
    const userId = "user123";
    const mockUserProfile = {
      _id: userId,
      name: "Test User",
      email: "test@example.com",
    };

    it("should fetch user profile successfully", async () => {
      mockSelect.mockResolvedValue(mockUserProfile);

      const result = await userService.getProfile(userId);

      expect(MockedUser.findById).toHaveBeenCalledWith(userId);
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(result).toEqual(mockUserProfile);
    });

    it("should throw an error if user is not found", async () => {
      mockSelect.mockResolvedValue(null);

      await expect(userService.getProfile(userId)).rejects.toThrow(
        "Failed to fetch user profile: User not found"
      );
      expect(MockedUser.findById).toHaveBeenCalledWith(userId);
      expect(mockSelect).toHaveBeenCalledWith("-password");
    });

    it("should throw an error if findById/select fails", async () => {
      const error = new Error("Database error");
      mockSelect.mockRejectedValue(error);

      await expect(userService.getProfile(userId)).rejects.toThrow(
        `Failed to fetch user profile: ${error.message}`
      );
      expect(MockedUser.findById).toHaveBeenCalledWith(userId);
      expect(mockSelect).toHaveBeenCalledWith("-password");
    });

    it("should throw an error if fetching fails with non-Error object", async () => {
      const error = "Database find failed string";
      mockSelect.mockRejectedValue(error);

      await expect(userService.getProfile(userId)).rejects.toThrow(
        `Failed to fetch user profile: ${error}`
      );
    });
  });

  describe("updateProfile", () => {
    const userId = "user123";
    const updateData: RequireAtLeastOne<Omit<TUser, "_id">> = {
      name: "Updated Name",
      phone: "1234567890",
    };
    const updateDataWithDisallowed = {
      name: "Updated Name Again",
      phone: "9876543210",
      email: "new@example.com",
      password: "newpassword",
      role: "admin",
      status: "inactive",
    };
    const allowedUpdates = { name: "Updated Name Again", phone: "9876543210" };
    const mockUpdatedUser = {
      _id: userId,
      name: updateData.name,
      phone: updateData.phone,
    };

    it("should update user profile successfully with allowed fields", async () => {
      mockSelect.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(MockedUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true }
      );
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(result).toEqual(mockUpdatedUser);
    });

    it("should update user profile successfully ignoring disallowed fields", async () => {
      const expectedResult = { _id: userId, ...allowedUpdates };
      mockSelect.mockResolvedValue(expectedResult);

      const result = await userService.updateProfile(
        userId,
        updateDataWithDisallowed
      );

      expect(MockedUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        allowedUpdates,
        { new: true }
      );
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(result).toEqual(expectedResult);
    });

    it("should throw an error if user to update is not found", async () => {
      mockSelect.mockResolvedValue(null);

      await expect(
        userService.updateProfile(userId, updateData)
      ).rejects.toThrow("Failed to update user profile: User not found");
      expect(MockedUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true }
      );
      expect(mockSelect).toHaveBeenCalledWith("-password");
    });

    it("should throw an error if findByIdAndUpdate/select fails", async () => {
      const error = new Error("Database update error");
      mockSelect.mockRejectedValue(error);

      await expect(
        userService.updateProfile(userId, updateData)
      ).rejects.toThrow(`Failed to update user profile: ${error.message}`);
      expect(MockedUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true }
      );
      expect(mockSelect).toHaveBeenCalledWith("-password");
    });

    it("should throw an error if updating fails with non-Error object", async () => {
      const error = "Database update failed string";
      mockSelect.mockRejectedValue(error);

      await expect(
        userService.updateProfile(userId, updateData)
      ).rejects.toThrow(`Failed to update user profile: ${error}`);
    });
  });
});
