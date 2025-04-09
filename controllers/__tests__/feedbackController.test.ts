import type { Request, Response } from "express";
import {
  submitFeedback,
  getTripFeedback,
  getUserFeedback,
} from "../../controllers/feedbackContoller.ts";
import { FeedbackService } from "../../services/FeedbackService.ts";

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

jest.mock("../../services/FeedbackService");

describe("Feedback Controller", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockFeedbackService: jest.Mocked<FeedbackService>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { userId: "mockUserId" }, // Mock authenticated user
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();

    mockFeedbackService = new FeedbackService() as jest.Mocked<FeedbackService>;
    (FeedbackService as jest.Mock).mockImplementation(
      () => mockFeedbackService
    );
  });

  describe("submitFeedback", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      mockRequest.body = { rating: 5 };

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Trip ID and rating are required",
      });
    });

    it("should create feedback and return 201 status", async () => {
      const mockFeedback = {
        _id: "mockFeedbackId",
        user_id: "mockUserId",
        trip_id: "mockTripId",
        rating: 5,
        comments: "Great trip",
      };

      mockRequest.body = {
        tripId: "mockTripId",
        rating: 5,
        comments: "Great trip",
      };

      mockFeedbackService.createFeedback.mockResolvedValue(
        mockFeedback as jest.Mocked<any>
      );

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockFeedbackService.createFeedback).toHaveBeenCalledWith(
        "mockUserId",
        "mockTripId",
        5,
        "Great trip"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockFeedback,
      });
    });

    it("should handle errors and return 400 status", async () => {
      const errorMessage = "Failed to save feedback";
      mockRequest.body = {
        tripId: "mockTripId",
        rating: 5,
      };

      mockFeedbackService.createFeedback.mockRejectedValue(
        new Error(errorMessage)
      );

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });
  });

  describe("getTripFeedback", () => {
    it("should return feedback for a specific trip", async () => {
      const mockFeedbackList = [
        {
          _id: "mockFeedbackId1",
          user_id: "mockUserId",
          trip_id: "mockTripId",
          rating: 5,
        },
        {
          _id: "mockFeedbackId2",
          user_id: "anotherUserId",
          trip_id: "mockTripId",
          rating: 4,
        },
      ];

      mockRequest.params = { tripId: "mockTripId" };
      mockFeedbackService.getFeedbackByTrip.mockResolvedValue(
        mockFeedbackList as jest.Mocked<any>
      );

      await getTripFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockFeedbackService.getFeedbackByTrip).toHaveBeenCalledWith(
        "mockTripId"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockFeedbackList,
      });
    });

    it("should handle errors and return 400 status", async () => {
      const errorMessage = "Failed to fetch feedback";
      mockRequest.params = { tripId: "mockTripId" };
      mockFeedbackService.getFeedbackByTrip.mockRejectedValue(
        new Error(errorMessage)
      );

      await getTripFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });
  });

  describe("getUserFeedback", () => {
    it("should return feedback for the authenticated user", async () => {
      const mockFeedbackList = [
        {
          _id: "mockFeedbackId1",
          user_id: "mockUserId",
          trip_id: "mockTripId",
          rating: 5,
        },
        {
          _id: "mockFeedbackId2",
          user_id: "mockUserId",
          trip_id: "anotherTripId",
          rating: 3,
        },
      ];

      mockFeedbackService.getUserFeedback.mockResolvedValue(
        mockFeedbackList as jest.Mocked<any>
      );

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockFeedbackService.getUserFeedback).toHaveBeenCalledWith(
        "mockUserId"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockFeedbackList,
      });
    });

    it("should return feedback for a specific user if userId is provided", async () => {
      const mockFeedbackList = [
        {
          _id: "mockFeedbackId1",
          user_id: "specificUserId",
          trip_id: "mockTripId",
          rating: 5,
        },
        {
          _id: "mockFeedbackId2",
          user_id: "specificUserId",
          trip_id: "anotherTripId",
          rating: 3,
        },
      ];

      mockRequest.params = { userId: "specificUserId" };
      mockFeedbackService.getUserFeedback.mockResolvedValue(
        mockFeedbackList as jest.Mocked<any>
      );

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockFeedbackService.getUserFeedback).toHaveBeenCalledWith(
        "specificUserId"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockFeedbackList,
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.user = undefined;
      mockRequest.params = {}; // No userId parameter

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated",
      });
    });

    it("should handle errors and return 400 status", async () => {
      const errorMessage = "Failed to fetch user feedback";
      mockFeedbackService.getUserFeedback.mockRejectedValue(
        new Error(errorMessage)
      );

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });
  });
});
