import { Request, Response } from "express";
import { getProfile, updateProfile } from "../../controllers/userController.ts";
import { UserService } from "../../services/UserService.ts";

describe("User Controller", () => {
  let mockUserService: jest.Mocked<UserService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockReq = {
      params: { id: "test-user-id" },
      body: {},
    };

    mockRes = {
      status: mockStatus,
    };

    mockUserService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    } as any;

    jest
      .spyOn(UserService.prototype, "getProfile")
      .mockImplementation(mockUserService.getProfile);
    jest
      .spyOn(UserService.prototype, "updateProfile")
      .mockImplementation(mockUserService.updateProfile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should retrieve user profile successfully", async () => {
      const mockUserProfile = {
        _id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
      };

      mockUserService.getProfile.mockResolvedValue(mockUserProfile);

      await getProfile(mockReq as Request, mockRes as Response);

      expect(mockUserService.getProfile).toHaveBeenCalledWith("test-user-id");
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockUserProfile,
      });
    });

    it("should handle profile retrieval error", async () => {
      const errorMessage = "User not found";
      mockUserService.getProfile.mockRejectedValue(new Error(errorMessage));

      await getProfile(mockReq as Request, mockRes as Response);

      expect(mockUserService.getProfile).toHaveBeenCalledWith("test-user-id");
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const updateData = { name: "Updated Name", phone: "1234567890" };
      mockReq.body = updateData;

      const mockUpdatedProfile = {
        _id: "test-user-id",
        ...updateData,
      };

      mockUserService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await updateProfile(mockReq as Request, mockRes as Response);

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        "test-user-id",
        updateData,
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedProfile,
      });
    });

    it("should handle profile update error", async () => {
      const updateData = { name: "Updated Name" };
      mockReq.body = updateData;

      const errorMessage = "Update failed";
      mockUserService.updateProfile.mockRejectedValue(new Error(errorMessage));

      await updateProfile(mockReq as Request, mockRes as Response);

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        "test-user-id",
        updateData,
      );
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });
  });
});
