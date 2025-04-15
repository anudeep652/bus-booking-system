//@ts-nocheck
import type { Request, Response } from "express";
import {
  submitFeedback,
  getTripFeedback,
  getUserFeedback,
} from "../feedbackContoller";
import { FeedbackService } from "../../services/FeedbackService";

jest.mock("../../services/FeedbackService");

const mockFeedbackService = FeedbackService as jest.MockedClass<
  typeof FeedbackService
>;

describe("Feedback Controller", () => {
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
      user: undefined,
    };
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
    jest.clearAllMocks();
  });

  describe("submitFeedback", () => {
    const feedbackData = {
      tripId: "trip123",
      rating: 5,
      comments: "Great trip!",
    };
    const userId = "user456";
    const createdFeedback = { id: "fb1", ...feedbackData, userId };

    it("should submit feedback successfully and return 201", async () => {
      mockRequest.body = feedbackData;
      mockRequest.user = { userId };
      (
        mockFeedbackService.prototype.createFeedback as jest.Mock
      ).mockResolvedValue(createdFeedback);

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockFeedbackService.prototype.createFeedback).toHaveBeenCalledWith(
        userId,
        feedbackData.tripId,
        feedbackData.rating,
        feedbackData.comments
      );
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: createdFeedback,
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      mockRequest.body = feedbackData;
      mockRequest.user = undefined;

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.createFeedback
      ).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated",
      });
    });

    it("should return 400 if tripId is missing", async () => {
      mockRequest.body = { rating: 4, comments: "Okay" };
      mockRequest.user = { userId };

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.createFeedback
      ).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Trip ID and rating are required",
      });
    });

    it("should return 400 if rating is missing", async () => {
      mockRequest.body = { tripId: "trip123", comments: "Okay" };
      mockRequest.user = { userId };

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.createFeedback
      ).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Trip ID and rating are required",
      });
    });

    it("should return 400 if feedback service throws an Error", async () => {
      const errorMessage = "Database constraint failed";
      mockRequest.body = feedbackData;
      mockRequest.user = { userId };
      (
        mockFeedbackService.prototype.createFeedback as jest.Mock
      ).mockRejectedValue(new Error(errorMessage));

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockFeedbackService.prototype.createFeedback).toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should return 400 if feedback service throws a non-Error", async () => {
      const errorObject = { code: "INVALID_INPUT" };
      mockRequest.body = feedbackData;
      mockRequest.user = { userId };
      (
        mockFeedbackService.prototype.createFeedback as jest.Mock
      ).mockRejectedValue(errorObject);

      await submitFeedback(mockRequest as Request, mockResponse as Response);

      expect(mockFeedbackService.prototype.createFeedback).toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to submit feedback",
      });
    });
  });

  describe("getTripFeedback", () => {
    const tripId = "trip789";
    const feedbackList = [
      { id: "fb1", userId: "u1", tripId, rating: 5, comments: "Excellent" },
      { id: "fb2", userId: "u2", tripId, rating: 4, comments: "Good" },
    ];

    it("should get feedback for a trip and return 200", async () => {
      mockRequest.params = { tripId };
      (
        mockFeedbackService.prototype.getFeedbackByTrip as jest.Mock
      ).mockResolvedValue(feedbackList);

      await getTripFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getFeedbackByTrip
      ).toHaveBeenCalledWith(tripId);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: feedbackList,
      });
    });

    it("should return 400 if service throws an Error", async () => {
      const errorMessage = "Could not fetch feedback";
      mockRequest.params = { tripId };
      (
        mockFeedbackService.prototype.getFeedbackByTrip as jest.Mock
      ).mockRejectedValue(new Error(errorMessage));

      await getTripFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getFeedbackByTrip
      ).toHaveBeenCalledWith(tripId);
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should return 400 if service throws a non-Error", async () => {
      const errorObject = "Some random error";
      mockRequest.params = { tripId };
      (
        mockFeedbackService.prototype.getFeedbackByTrip as jest.Mock
      ).mockRejectedValue(errorObject);

      await getTripFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getFeedbackByTrip
      ).toHaveBeenCalledWith(tripId);
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get feedback",
      });
    });
  });

  describe("getUserFeedback", () => {
    const userIdFromParams = "userParam1";
    const userIdFromAuth = "userAuth2";
    const feedbackList = [
      { id: "fb3", userId: userIdFromAuth, tripId: "t1", rating: 3 },
    ];

    it("should get feedback for a user from req.user and return 200", async () => {
      mockRequest.user = { userId: userIdFromAuth };
      mockRequest.params = {};
      (
        mockFeedbackService.prototype.getUserFeedback as jest.Mock
      ).mockResolvedValue(feedbackList);

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getUserFeedback
      ).toHaveBeenCalledWith(userIdFromAuth);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: feedbackList,
      });
    });

    it("should get feedback for a user from req.params and return 200", async () => {
      mockRequest.params = { userId: userIdFromParams };
      mockRequest.user = undefined;
      (
        mockFeedbackService.prototype.getUserFeedback as jest.Mock
      ).mockResolvedValue(feedbackList);

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getUserFeedback
      ).toHaveBeenCalledWith(userIdFromParams);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: feedbackList,
      });
    });

    it("should prioritize userId from req.params over req.user", async () => {
      mockRequest.params = { userId: userIdFromParams };
      mockRequest.user = { userId: userIdFromAuth };
      (
        mockFeedbackService.prototype.getUserFeedback as jest.Mock
      ).mockResolvedValue(feedbackList);

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getUserFeedback
      ).toHaveBeenCalledWith(userIdFromParams);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: feedbackList,
      });
    });

    it("should return 401 if userId is not available in params or user", async () => {
      mockRequest.params = {};
      mockRequest.user = undefined;

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getUserFeedback
      ).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated",
      });
    });

    it("should return 400 if service throws an Error", async () => {
      const errorMessage = "Failed to retrieve user feedback";
      mockRequest.user = { userId: userIdFromAuth };
      mockRequest.params = {};
      (
        mockFeedbackService.prototype.getUserFeedback as jest.Mock
      ).mockRejectedValue(new Error(errorMessage));

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getUserFeedback
      ).toHaveBeenCalledWith(userIdFromAuth);
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should return 400 if service throws a non-Error", async () => {
      const errorObject = { status: 503, detail: "Service Unavailable" };
      mockRequest.user = { userId: userIdFromAuth };
      mockRequest.params = {};
      (
        mockFeedbackService.prototype.getUserFeedback as jest.Mock
      ).mockRejectedValue(errorObject);

      await getUserFeedback(mockRequest as Request, mockResponse as Response);

      expect(
        mockFeedbackService.prototype.getUserFeedback
      ).toHaveBeenCalledWith(userIdFromAuth);
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to get user feedback",
      });
    });
  });
});
