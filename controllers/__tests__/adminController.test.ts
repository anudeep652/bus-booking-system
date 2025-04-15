// @ts-nocheck
const mockListUsers = jest.fn();
const mockListOperators = jest.fn();
const mockChangeUserStatus = jest.fn();
const mockChangeOperatorVerificationStatus = jest.fn();
const mockGetAllTrips = jest.fn();
const mockChangeTripStatus = jest.fn();
const mockGetReports = jest.fn();

jest.mock("../../services/auth/AuthServiceFactory", () => {
  return {
    AuthServiceFactory: {
      createAuthService: jest.fn().mockImplementation((role: string) => {
        if (role === "admin") {
          return {
            login: mockLogin,
            register: mockRegister,
          };
        }
        return undefined;
      }),
    },
  };
});

jest.mock("../../services/AdminService", () => {
  return {
    AdminService: jest.fn().mockImplementation(() => {
      return {
        listUsers: mockListUsers,
        listOperators: mockListOperators,
        changeUserStatus: mockChangeUserStatus,
        changeOperatorVerificationStatus: mockChangeOperatorVerificationStatus,
        getAllTrips: mockGetAllTrips,
        changeTripStatus: mockChangeTripStatus,
        getReports: mockGetReports,
      };
    }),
  };
});

import {
  loginAdmin,
  registerAdmin,
  listUsers,
  listOperators,
  changeUserStatus,
  changeOperatorVerificationStatus,
  getAllTrips,
  changeTripStatus,
  getReports,
} from "../adminController";
import type { Request, Response } from "express";
import type { TripStatus } from "../../types/index";
import { AuthServiceFactory } from "../../services/auth/AuthServiceFactory";

const mockLogin = jest.fn();
const mockRegister = jest.fn();

const mockRequest = (body = {}, params = {}, query = {}): Request => {
  return {
    body,
    params,
    query,
  } as Request;
};

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
};

describe("Admin Controller", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
  });

  describe("loginAdmin", () => {
    it("should call authService.login and return token on success", async () => {
      req = mockRequest({ email: "admin@test.com", password: "password" });
      const mockResult = {
        statusCode: 200,
        message: "Login successful",
        token: "mockToken123",
      };
      mockLogin.mockResolvedValue(mockResult);

      await loginAdmin(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith(
        "admin"
      );
      expect(mockLogin).toHaveBeenCalledWith("admin@test.com", "password");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: "mockToken123",
      });
    });

    it("should return error status and message if authService.login fails", async () => {
      req = mockRequest({ email: "admin@test.com", password: "wrong" });
      const mockResult = {
        statusCode: 401,
        message: "Invalid credentials",
        token: undefined,
      };
      mockLogin.mockResolvedValue(mockResult);

      await loginAdmin(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith(
        "admin"
      );
      expect(mockLogin).toHaveBeenCalledWith("admin@test.com", "wrong");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
        token: undefined,
      });
    });
  });

  describe("registerAdmin", () => {
    it("should call authService.register and return token on success", async () => {
      const adminData = {
        name: "Admin",
        email: "newadmin@test.com",
        password: "password123",
      };
      req = mockRequest(adminData);
      const mockResult = {
        statusCode: 201,
        message: "Admin registered successfully",
        token: "newToken456",
      };
      mockRegister.mockResolvedValue(mockResult);

      await registerAdmin(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith(
        "admin"
      );
      expect(mockRegister).toHaveBeenCalledWith(adminData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Admin registered successfully",
        token: "newToken456",
      });
    });

    it("should return error status and message if authService.register fails", async () => {
      const adminData = {
        name: "Admin",
        email: "newadmin@test.com",
        password: "password123",
      };
      req = mockRequest(adminData);
      const mockResult = {
        statusCode: 400,
        message: "Email already exists",
        token: undefined,
      };
      mockRegister.mockResolvedValue(mockResult);

      await registerAdmin(req, res);

      expect(AuthServiceFactory.createAuthService).toHaveBeenCalledWith(
        "admin"
      );
      expect(mockRegister).toHaveBeenCalledWith(adminData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already exists",
        token: undefined,
      });
    });
  });

  describe("listUsers", () => {
    it("should list users with default pagination", async () => {
      req = mockRequest({}, {}, {});
      const mockUsers = [{ id: "1", name: "User 1" }];
      mockListUsers.mockResolvedValue(mockUsers);

      await listUsers(req, res);

      expect(mockListUsers).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUsers });
    });

    it("should list users with provided pagination", async () => {
      req = mockRequest({}, {}, { page: "2", limit: "5" });
      const mockUsers = [{ id: "2", name: "User 2" }];
      mockListUsers.mockResolvedValue(mockUsers);

      await listUsers(req, res);

      expect(mockListUsers).toHaveBeenCalledWith(2, 5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUsers });
    });

    it("should handle invalid pagination query params gracefully", async () => {
      req = mockRequest({}, {}, { page: "abc", limit: "-5" });
      const mockUsers = [{ id: "3", name: "User 3" }];
      mockListUsers.mockResolvedValue(mockUsers);

      await listUsers(req, res);

      expect(mockListUsers).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUsers });
    });

    it("should return 500 if service throws an Error", async () => {
      req = mockRequest();
      const error = new Error("Database error");
      mockListUsers.mockRejectedValue(error);

      await listUsers(req, res);

      expect(mockListUsers).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });

    it("should return 500 if service throws a non-Error", async () => {
      req = mockRequest();
      const error = "Unknown issue";
      mockListUsers.mockRejectedValue(error);

      await listUsers(req, res);

      expect(mockListUsers).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to get list of users, An unknown error occurred: Unknown issue",
      });
    });
  });

  describe("listOperators", () => {
    it("should list operators with default pagination", async () => {
      req = mockRequest({}, {}, {}); // Empty query
      const mockOperators = [{ id: "op1", name: "Operator 1" }];
      mockListOperators.mockResolvedValue(mockOperators);

      await listOperators(req, res);

      expect(mockListOperators).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOperators,
      });
    });

    it("should return 500 if service throws an Error", async () => {
      req = mockRequest();
      const error = new Error("DB connection lost");
      mockListOperators.mockRejectedValue(error);

      await listOperators(req, res);

      expect(mockListOperators).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB connection lost",
      });
    });

    it("should return 500 if service throws a non-Error", async () => {
      req = mockRequest();
      const error = { code: 123 };
      mockListOperators.mockRejectedValue(error);

      await listOperators(req, res);

      expect(mockListOperators).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to list all operators, An unknown error occurred: [object Object]",
      });
    });
  });

  describe("changeUserStatus", () => {
    const userId = "user123";
    const mockUser = { id: userId, status: "active" };

    it("should change user status successfully", async () => {
      req = mockRequest({ status: "active" }, { id: userId });
      mockChangeUserStatus.mockResolvedValue(mockUser);

      await changeUserStatus(req, res);

      expect(mockChangeUserStatus).toHaveBeenCalledWith(userId, "active");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });

    it("should return 400 for invalid status", async () => {
      req = mockRequest({ status: "pending" }, { id: userId });

      await changeUserStatus(req, res);

      expect(mockChangeUserStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          'Failed to change user status, Invalid status. Must be "active" or "inactive"',
      });
    });

    it("should return 404 if user not found", async () => {
      req = mockRequest({ status: "inactive" }, { id: "nonexistent" });
      mockChangeUserStatus.mockResolvedValue(null);

      await changeUserStatus(req, res);

      expect(mockChangeUserStatus).toHaveBeenCalledWith(
        "nonexistent",
        "inactive"
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to change user status, User not found",
      });
    });

    it("should return 500 if service throws an Error", async () => {
      req = mockRequest({ status: "active" }, { id: userId });
      const error = new Error("Update failed");
      mockChangeUserStatus.mockRejectedValue(error);

      await changeUserStatus(req, res);

      expect(mockChangeUserStatus).toHaveBeenCalledWith(userId, "active");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Update failed",
      });
    });

    it("should return 500 if service throws a non-Error", async () => {
      req = mockRequest({ status: "active" }, { id: userId });
      const error = "Something went wrong";
      mockChangeUserStatus.mockRejectedValue(error);

      await changeUserStatus(req, res);

      expect(mockChangeUserStatus).toHaveBeenCalledWith(userId, "active");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "An unknown error occurred: Something went wrong",
      });
    });
  });

  describe("changeOperatorVerificationStatus", () => {
    const operatorId = "op123";
    const mockOperator = { id: operatorId, verificationStatus: "verified" };

    it("should change operator status successfully", async () => {
      req = mockRequest({ status: "verified" }, { id: operatorId });
      mockChangeOperatorVerificationStatus.mockResolvedValue(mockOperator);

      await changeOperatorVerificationStatus(req, res);

      expect(mockChangeOperatorVerificationStatus).toHaveBeenCalledWith(
        operatorId,
        "verified"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOperator,
      });
    });

    it("should return 400 for invalid status", async () => {
      req = mockRequest({ status: "active" }, { id: operatorId });

      await changeOperatorVerificationStatus(req, res);

      expect(mockChangeOperatorVerificationStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          'Failed to change operator verification status, Invalid status. Must be "pending" or "verified" or "rejected".',
      });
    });

    it("should return 404 if operator not found", async () => {
      req = mockRequest({ status: "rejected" }, { id: "nonexistentOp" });
      mockChangeOperatorVerificationStatus.mockResolvedValue(null);

      await changeOperatorVerificationStatus(req, res);

      expect(mockChangeOperatorVerificationStatus).toHaveBeenCalledWith(
        "nonexistentOp",
        "rejected"
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to change operator verification status, Operator not found",
      });
    });

    it("should return 500 if service throws an Error", async () => {
      req = mockRequest({ status: "pending" }, { id: operatorId });
      const error = new Error("Server unavailable");
      mockChangeOperatorVerificationStatus.mockRejectedValue(error);

      await changeOperatorVerificationStatus(req, res);

      expect(mockChangeOperatorVerificationStatus).toHaveBeenCalledWith(
        operatorId,
        "pending"
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server unavailable",
      });
    });

    it("should return 500 if service throws a non-Error", async () => {
      req = mockRequest({ status: "pending" }, { id: operatorId });
      const error = 12345;
      mockChangeOperatorVerificationStatus.mockRejectedValue(error);

      await changeOperatorVerificationStatus(req, res);

      expect(mockChangeOperatorVerificationStatus).toHaveBeenCalledWith(
        operatorId,
        "pending"
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to change operator verification status, An unknown error occurred",
      });
    });
  });

  describe("getAllTrips", () => {
    it("should get all trips with default pagination", async () => {
      req = mockRequest({}, {}, {});
      const mockTrips = [{ id: "trip1", name: "Trip 1" }];
      mockGetAllTrips.mockResolvedValue(mockTrips);

      await getAllTrips(req, res);

      expect(mockGetAllTrips).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTrips });
    });

    it("should return 500 if service throws an Error", async () => {
      req = mockRequest();
      const error = new Error("Cannot fetch trips");
      mockGetAllTrips.mockRejectedValue(error);

      await getAllTrips(req, res);

      expect(mockGetAllTrips).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Cannot fetch trips",
      });
    });

    it("should return 500 if service throws a non-Error", async () => {
      req = mockRequest();
      const error = "System offline";
      mockGetAllTrips.mockRejectedValue(error);

      await getAllTrips(req, res);

      expect(mockGetAllTrips).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message:
          "Failed to get all trips, An unknown error occurred System offline",
      });
    });
  });

  describe("changeTripStatus", () => {
    const tripId = "trip123";
    const mockTrip = { id: tripId, status: "cancelled" as TripStatus };

    it("should change trip status using status from req.body", async () => {
      req = mockRequest({ status: "cancelled" }, { id: tripId });
      mockChangeTripStatus.mockResolvedValue(mockTrip);
      const explicitTripStatus: TripStatus | undefined = undefined;

      await changeTripStatus(req, res, explicitTripStatus);

      expect(mockChangeTripStatus).toHaveBeenCalledWith(tripId, "cancelled");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTrip });
    });

    it("should change trip status using explicit tripStatus argument", async () => {
      req = mockRequest({ status: "scheduled" }, { id: tripId });
      mockChangeTripStatus.mockResolvedValue({
        ...mockTrip,
        status: "completed",
      });
      const explicitTripStatus: TripStatus = "completed";

      await changeTripStatus(req, res, explicitTripStatus);

      expect(mockChangeTripStatus).toHaveBeenCalledWith(tripId, "completed");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { ...mockTrip, status: "completed" },
      });
    });

    it("should return 400 for invalid status from req.body when explicit status is not provided", async () => {
      req = mockRequest({ status: "pending" }, { id: tripId });
      const explicitTripStatus: TripStatus | undefined = undefined;

      await changeTripStatus(req, res, explicitTripStatus);

      expect(mockChangeTripStatus).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          'Failed to change trip status, Invalid status. Must be "scheduled" or "completed" or "cancelled".',
      });
    });

    it("should NOT return 400 if status in body is invalid BUT explicit status is provided", async () => {
      req = mockRequest({ status: "invalid_in_body" }, { id: tripId });
      mockChangeTripStatus.mockResolvedValue({
        ...mockTrip,
        status: "scheduled",
      });
      const explicitTripStatus: TripStatus = "scheduled";

      await changeTripStatus(req, res, explicitTripStatus);

      expect(mockChangeTripStatus).toHaveBeenCalledWith(tripId, "scheduled");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { ...mockTrip, status: "scheduled" },
      });
    });

    it("should return 404 if trip not found", async () => {
      req = mockRequest({ status: "completed" }, { id: "nonexistentTrip" });
      mockChangeTripStatus.mockResolvedValue(null);
      const explicitTripStatus: TripStatus | undefined = undefined;

      await changeTripStatus(req, res, explicitTripStatus);

      expect(mockChangeTripStatus).toHaveBeenCalledWith(
        "nonexistentTrip",
        "completed"
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to change trip status, Trip not found",
      });
    });

    it("should return 500 if service throws an Error", async () => {
      req = mockRequest({ status: "cancelled" }, { id: tripId });
      const error = new Error("Trip update collision");
      mockChangeTripStatus.mockRejectedValue(error);
      const explicitTripStatus: TripStatus | undefined = undefined;

      await changeTripStatus(req, res, explicitTripStatus);

      expect(mockChangeTripStatus).toHaveBeenCalledWith(tripId, "cancelled");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Trip update collision",
      });
    });

    it("should return 500 if service throws a non-Error", async () => {
      req = mockRequest({ status: "cancelled" }, { id: tripId });
      const error = { msg: "weird error" };
      mockChangeTripStatus.mockRejectedValue(error);
      const explicitTripStatus: TripStatus | undefined = undefined;

      await changeTripStatus(req, res, explicitTripStatus);

      expect(mockChangeTripStatus).toHaveBeenCalledWith(tripId, "cancelled");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to change trip status, An unknown error occurred [object Object]",
      });
    });
  });

  describe("getReports", () => {
    it("should fetch reports successfully", async () => {
      req = mockRequest();
      const mockReportData = { users: 100, operators: 20, trips: 500 };
      mockGetReports.mockResolvedValue(mockReportData);

      await getReports(req, res);

      expect(mockGetReports).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReportData,
      });
    });

    it("should return 500 if service throws an Error", async () => {
      req = mockRequest();
      const error = new Error("Reporting service down");
      mockGetReports.mockRejectedValue(error);

      await getReports(req, res);

      expect(mockGetReports).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Reporting service down",
      });
    });

    it("should return 500 if service throws a non-Error", async () => {
      req = mockRequest();
      const error = "Timeout";
      mockGetReports.mockRejectedValue(error);

      await getReports(req, res);

      expect(mockGetReports).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get reports, An unknown error occurred",
      });
    });
  });
});
