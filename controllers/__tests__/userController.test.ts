// @ts-nocheck
import { Request, Response } from "express";
import { AuthServiceFactory } from "../../services/auth/AuthServiceFactory.ts";
import { UserService } from "../../services/UserService.ts";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
} from "../userController.ts";

jest.mock("../../services/auth/AuthServiceFactory");

jest.mock("../../services/UserService", () => {
  const mockGetProfile_internal = jest.fn();
  const mockUpdateProfile_internal = jest.fn();
  return {
    __esModule: true,
    UserService: jest.fn().mockImplementation(() => {
      return {
        getProfile: mockGetProfile_internal,
        updateProfile: mockUpdateProfile_internal,
      };
    }),
  };
});

const mockRequest = (body = {}, params = {}, query = {}) =>
  ({
    body,
    params,
    query,
  } as Request);

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe("AuthController", () => {
  let req: Request;
  let res: Response;

  const mockAuthServiceInstance = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const MockedUserService = UserService as jest.MockedClass<typeof UserService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (AuthServiceFactory.createAuthService as jest.Mock).mockReturnValue(
      mockAuthServiceInstance
    );
    res = mockResponse();
  });

  const getMockUserServiceMethods = () => {
    const instance = new MockedUserService();
    if (
      !instance ||
      typeof instance.getProfile?.mockClear !== "function" ||
      typeof instance.updateProfile?.mockClear !== "function"
    ) {
      console.error(
        "!!! Failed to get valid instance with mock methods from mocked UserService constructor !!!",
        instance
      );
      return { getProfile: undefined, updateProfile: undefined };
    }
    return instance as { getProfile: jest.Mock; updateProfile: jest.Mock };
  };

  describe("registerUser", () => {
    it("should register a user successfully", async () => {
      const userData = { email: "test@example.com", password: "password123" };
      const result = {
        statusCode: 201,
        message: "User registered",
        token: "fake-token",
      };
      req = mockRequest(userData);
      mockAuthServiceInstance.register.mockResolvedValue(result);

      await registerUser(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith("user");
      expect(mockAuthServiceInstance.register).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered",
        token: "fake-token",
      });
    });

    it("should handle registration failure", async () => {
      const userData = { email: "test@example.com", password: "password123" };
      const result = {
        statusCode: 400,
        message: "Registration failed",
        token: undefined,
      };
      req = mockRequest(userData);
      mockAuthServiceInstance.register.mockResolvedValue(result);

      await registerUser(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith("user");
      expect(mockAuthServiceInstance.register).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Registration failed",
        token: undefined,
      });
    });
  });

  describe("loginUser", () => {
    it("should log in a user successfully", async () => {
      const loginData = { email: "test@example.com", password: "password123" };
      const result = {
        statusCode: 200,
        message: "Login successful",
        token: "fake-token",
      };
      req = mockRequest(loginData);
      mockAuthServiceInstance.login.mockResolvedValue(result);

      await loginUser(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith("user");
      expect(mockAuthServiceInstance.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: "fake-token",
      });
    });

    it("should handle login failure", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };
      const result = {
        statusCode: 401,
        message: "Invalid credentials",
        token: undefined,
      };
      req = mockRequest(loginData);
      mockAuthServiceInstance.login.mockResolvedValue(result);

      await loginUser(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith("user");
      expect(mockAuthServiceInstance.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
        token: undefined,
      });
    });
  });

  describe("getProfile", () => {
    const userId = "user123";

    it("should get user profile successfully", async () => {
      const userProfile = {
        id: userId,
        name: "Test User",
        email: "test@example.com",
      };
      req = mockRequest({}, { id: userId });

      const methods = getMockUserServiceMethods();
      const mockMethod = methods.getProfile;

      if (!mockMethod)
        throw new Error("getProfile mock method was not retrieved correctly.");

      mockMethod.mockResolvedValue(userProfile);

      await getProfile(req, res);

      expect(mockMethod).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: userProfile,
      });
    });

    it("should handle errors when getting profile (Error instance)", async () => {
      const errorMessage = "User not found";
      req = mockRequest({}, { id: userId });

      const methods = getMockUserServiceMethods();
      const mockMethod = methods.getProfile;
      if (!mockMethod)
        throw new Error("getProfile mock method was not retrieved correctly.");

      mockMethod.mockRejectedValue(new Error(errorMessage));

      await getProfile(req, res);

      expect(mockMethod).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should handle errors when getting profile (non-Error instance)", async () => {
      const errorObject = { details: "Some database error" };
      req = mockRequest({}, { id: userId });

      const methods = getMockUserServiceMethods();
      const mockMethod = methods.getProfile;
      if (!mockMethod)
        throw new Error("getProfile mock method was not retrieved correctly.");

      mockMethod.mockRejectedValue(errorObject);

      await getProfile(req, res);

      expect(mockMethod).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to retrieve user profile: [object Object]",
      });
    });
  });

  describe("updateProfile", () => {
    const userId = "user123";
    const updateData = { name: "Updated Name" };

    it("should update user profile successfully", async () => {
      const updatedUser = {
        id: userId,
        name: "Updated Name",
        email: "test@example.com",
      };
      req = mockRequest(updateData, { id: userId });

      const methods = getMockUserServiceMethods();
      const mockMethod = methods.updateProfile;
      if (!mockMethod)
        throw new Error(
          "updateProfile mock method was not retrieved correctly."
        );

      mockMethod.mockResolvedValue(updatedUser);

      await updateProfile(req, res);

      expect(mockMethod).toHaveBeenCalledWith(userId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser,
      });
    });

    it("should handle errors when updating profile (Error instance)", async () => {
      const errorMessage = "Update failed validation";
      req = mockRequest(updateData, { id: userId });

      const methods = getMockUserServiceMethods();
      const mockMethod = methods.updateProfile;
      if (!mockMethod)
        throw new Error(
          "updateProfile mock method was not retrieved correctly."
        );

      mockMethod.mockRejectedValue(new Error(errorMessage));

      await updateProfile(req, res);

      expect(mockMethod).toHaveBeenCalledWith(userId, updateData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should handle errors when updating profile (non-Error instance)", async () => {
      const errorObject = { code: "DB_CONN_ERROR" };
      req = mockRequest(updateData, { id: userId });

      const methods = getMockUserServiceMethods();
      const mockMethod = methods.updateProfile;
      if (!mockMethod)
        throw new Error(
          "updateProfile mock method was not retrieved correctly."
        );

      mockMethod.mockRejectedValue(errorObject);

      await updateProfile(req, res);

      expect(mockMethod).toHaveBeenCalledWith(userId, updateData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to update user profile: [object Object]",
      });
    });
  });
});
