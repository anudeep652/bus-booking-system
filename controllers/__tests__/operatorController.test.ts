import type { Request, Response } from "express";

const mockOperatorServiceInstance = {
  createTrip: jest.fn(),
  updateTrip: jest.fn(),
  cancelTrip: jest.fn(),
  getOperatorBookings: jest.fn(),
};

const mockAuthServiceInstance = {
  register: jest.fn(),
  login: jest.fn(),
};

jest.mock("../../services/OperatorService", () => {
  return jest.fn().mockImplementation(() => {
    return mockOperatorServiceInstance;
  });
});

jest.mock("../../services/auth/AuthServiceFactory", () => ({
  AuthServiceFactory: {
    createAuthService: jest.fn().mockReturnValue(mockAuthServiceInstance),
  },
}));

import {
  registerOperator,
  loginOperator,
  createTrip,
  updateTrip,
  cancelTrip,
  viewOperatorBookings,
} from "../operatorController.ts";

describe("Operator Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
    jest.clearAllMocks();
  });

  describe("registerOperator", () => {
    const registerData = {
      email: "op@test.com",
      password: "password123",
      name: "TestOp",
    };

    it("should register an operator successfully", async () => {
      const result = {
        statusCode: 201,
        message: "Operator registered",
        token: "token123",
      };
      mockRequest.body = registerData;
      mockAuthServiceInstance.register.mockResolvedValue(result);

      await registerOperator(mockRequest as Request, mockResponse as Response);

      expect(mockAuthServiceInstance.register).toHaveBeenCalledWith(
        registerData
      );
      expect(responseStatus).toHaveBeenCalledWith(result.statusCode);
      expect(responseJson).toHaveBeenCalledWith({
        message: result.message,
        token: result.token,
      });
    });

    it("should handle registration failure", async () => {
      const result = {
        statusCode: 400,
        message: "Registration failed",
        token: null,
      };
      mockRequest.body = registerData;
      mockAuthServiceInstance.register.mockResolvedValue(result);

      await registerOperator(mockRequest as Request, mockResponse as Response);

      expect(mockAuthServiceInstance.register).toHaveBeenCalledWith(
        registerData
      );
      expect(responseStatus).toHaveBeenCalledWith(result.statusCode);
      expect(responseJson).toHaveBeenCalledWith({
        message: result.message,
        token: result.token,
      });
    });
  });

  describe("loginOperator", () => {
    const loginData = { email: "op@test.com", password: "password123" };

    it("should log in an operator successfully", async () => {
      const result = {
        statusCode: 200,
        message: "Login successful",
        token: "token456",
      };
      mockRequest.body = loginData;
      mockAuthServiceInstance.login.mockResolvedValue(result);

      await loginOperator(mockRequest as Request, mockResponse as Response);

      expect(mockAuthServiceInstance.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(responseStatus).toHaveBeenCalledWith(result.statusCode);
      expect(responseJson).toHaveBeenCalledWith({
        message: result.message,
        token: result.token,
      });
    });

    it("should handle login failure", async () => {
      const result = {
        statusCode: 401,
        message: "Invalid credentials",
        token: null,
      };
      mockRequest.body = loginData;
      mockAuthServiceInstance.login.mockResolvedValue(result);

      await loginOperator(mockRequest as Request, mockResponse as Response);

      expect(mockAuthServiceInstance.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
      expect(responseStatus).toHaveBeenCalledWith(result.statusCode);
      expect(responseJson).toHaveBeenCalledWith({
        message: result.message,
        token: result.token,
      });
    });
  });

  describe("createTrip", () => {
    const tripData = {
      from: "CityA",
      to: "CityB",
      busId: "bus1",
      departureTime: new Date(),
    };
    const createdTrip = { id: "trip1", ...tripData };

    it("should create a trip successfully", async () => {
      mockRequest.body = tripData;
      mockOperatorServiceInstance.createTrip.mockResolvedValue(createdTrip);

      await createTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.createTrip).toHaveBeenCalledWith(
        tripData
      );
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: createdTrip,
      });
    });

    it("should handle trip creation failure with an Error", async () => {
      const errorMessage = "Database error";
      mockRequest.body = tripData;
      mockOperatorServiceInstance.createTrip.mockRejectedValue(
        new Error(errorMessage)
      );

      await createTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.createTrip).toHaveBeenCalledWith(
        tripData
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should handle trip creation failure with a non-Error", async () => {
      const errorObject = { code: "INVALID" };
      mockRequest.body = tripData;
      mockOperatorServiceInstance.createTrip.mockRejectedValue(errorObject);

      await createTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.createTrip).toHaveBeenCalledWith(
        tripData
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to create trip: " + errorObject,
      });
    });
  });

  describe("updateTrip", () => {
    const tripId = "trip1";
    const updateData = { capacity: 45 };
    const updatedTrip = {
      id: tripId,
      from: "CityA",
      to: "CityB",
      capacity: 45,
    };

    it("should update a trip successfully", async () => {
      mockRequest.params = { id: tripId };
      mockRequest.body = updateData;
      mockOperatorServiceInstance.updateTrip.mockResolvedValue(updatedTrip);

      await updateTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.updateTrip).toHaveBeenCalledWith(
        tripId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: updatedTrip,
      });
    });

    it("should return 404 if trip to update is not found", async () => {
      mockRequest.params = { id: tripId };
      mockRequest.body = updateData;
      mockOperatorServiceInstance.updateTrip.mockResolvedValue(null);

      await updateTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.updateTrip).toHaveBeenCalledWith(
        tripId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Trip not found.",
      });
    });

    it("should handle trip update failure with an Error", async () => {
      const errorMessage = "Update conflict";
      mockRequest.params = { id: tripId };
      mockRequest.body = updateData;
      mockOperatorServiceInstance.updateTrip.mockRejectedValue(
        new Error(errorMessage)
      );

      await updateTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.updateTrip).toHaveBeenCalledWith(
        tripId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should handle trip update failure with a non-Error", async () => {
      const errorObject = "Concurrency issue";
      mockRequest.params = { id: tripId };
      mockRequest.body = updateData;
      mockOperatorServiceInstance.updateTrip.mockRejectedValue(errorObject);

      await updateTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.updateTrip).toHaveBeenCalledWith(
        tripId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to update trip: " + errorObject,
      });
    });
  });

  describe("cancelTrip", () => {
    const tripId = "tripToCancel";

    it("should cancel a trip successfully", async () => {
      mockRequest.params = { id: tripId };
      mockOperatorServiceInstance.cancelTrip.mockResolvedValue({
        id: tripId,
        status: "cancelled",
      });

      await cancelTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.cancelTrip).toHaveBeenCalledWith(
        tripId
      );
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: tripId,
      });
    });

    it("should return 404 if trip to cancel is not found", async () => {
      mockRequest.params = { id: tripId };
      mockOperatorServiceInstance.cancelTrip.mockResolvedValue(null);

      await cancelTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.cancelTrip).toHaveBeenCalledWith(
        tripId
      );
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Trip not found.",
      });
    });

    it("should handle trip cancellation failure with an Error", async () => {
      const errorMessage = "Cannot cancel trip";
      mockRequest.params = { id: tripId };
      mockOperatorServiceInstance.cancelTrip.mockRejectedValue(
        new Error(errorMessage)
      );

      await cancelTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.cancelTrip).toHaveBeenCalledWith(
        tripId
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should handle trip cancellation failure with a non-Error", async () => {
      const errorObject = { reason: "Already started" };
      mockRequest.params = { id: tripId };
      mockOperatorServiceInstance.cancelTrip.mockRejectedValue(errorObject);

      await cancelTrip(mockRequest as Request, mockResponse as Response);

      expect(mockOperatorServiceInstance.cancelTrip).toHaveBeenCalledWith(
        tripId
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to cancel trip: " + errorObject,
      });
    });
  });

  describe("viewOperatorBookings", () => {
    const busId = "bus123";
    const bookings = [
      { id: "b1", userId: "u1" },
      { id: "b2", userId: "u2" },
    ];

    it("should view bookings for a specific bus successfully", async () => {
      mockRequest.query = { bus_id: busId };
      mockOperatorServiceInstance.getOperatorBookings.mockResolvedValue(
        bookings
      );

      await viewOperatorBookings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(
        mockOperatorServiceInstance.getOperatorBookings
      ).toHaveBeenCalledWith(busId);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: bookings,
      });
    });

    it("should view all bookings if no bus_id is provided", async () => {
      mockRequest.query = {};
      mockOperatorServiceInstance.getOperatorBookings.mockResolvedValue(
        bookings
      );

      await viewOperatorBookings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(
        mockOperatorServiceInstance.getOperatorBookings
      ).toHaveBeenCalledWith("");
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: bookings,
      });
    });

    it("should handle viewing bookings failure with an Error", async () => {
      const errorMessage = "Failed to fetch bookings";
      mockRequest.query = { bus_id: busId };
      mockOperatorServiceInstance.getOperatorBookings.mockRejectedValue(
        new Error(errorMessage)
      );

      await viewOperatorBookings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(
        mockOperatorServiceInstance.getOperatorBookings
      ).toHaveBeenCalledWith(busId);
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should handle viewing bookings failure with a non-Error", async () => {
      const errorObject = "DB Timeout";
      mockRequest.query = { bus_id: busId };
      mockOperatorServiceInstance.getOperatorBookings.mockRejectedValue(
        errorObject
      );

      await viewOperatorBookings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(
        mockOperatorServiceInstance.getOperatorBookings
      ).toHaveBeenCalledWith(busId);
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Error viewing operator bookings: " + errorObject,
      });
    });
  });
});
