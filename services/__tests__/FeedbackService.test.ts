// @ts-nocheck
import { FeedbackService } from "../../services/FeedbackService.ts";
import { Feedback } from "../../models/feedbackSchema.ts";
import mongoose from "mongoose";

jest.mock("../../models/feedbackSchema");
jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    Types: {
      ...actualMongoose.Types,
      ObjectId: jest.fn((id) => ({
        toString: () => id || new actualMongoose.Types.ObjectId().toString(),
        equals: (other: any) =>
          other?.toString() ===
          (id || new actualMongoose.Types.ObjectId().toString()),
      })),
    },
  };
});

const MockedFeedback = Feedback as jest.MockedClass<typeof Feedback>;
const mockMongooseObjectId = mongoose.Types.ObjectId as jest.Mock;

describe("FeedbackService", () => {
  let feedbackService: FeedbackService;
  let mockSave: jest.Mock;
  let mockFind: jest.Mock;
  let mockPopulate: jest.Mock;

  beforeEach(() => {
    feedbackService = new FeedbackService();
    mockSave = jest.fn();
    mockPopulate = jest.fn();
    mockFind = jest.fn(() => ({
      populate: mockPopulate,
    }));

    MockedFeedback.mockImplementation(
      (data: any) =>
        ({
          ...data,
          save: mockSave,
        } as any)
    );
    MockedFeedback.find = mockFind;
    mockMongooseObjectId.mockClear();
    jest.clearAllMocks();
  });

  describe("createFeedback", () => {
    const userId = "user123";
    const tripId = "trip456";
    const rating = 5;
    const comments = "Great trip!";
    const mockUserId = { toString: () => userId, equals: jest.fn() };
    const mockTripId = { toString: () => tripId, equals: jest.fn() };

    beforeEach(() => {
      mockMongooseObjectId
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockTripId);
    });

    it("should create and save feedback successfully", async () => {
      const feedbackData = {
        user_id: mockUserId,
        trip_id: mockTripId,
        rating,
        comments,
      };
      const savedFeedback = { ...feedbackData, _id: "feedback789" };
      mockSave.mockResolvedValue(savedFeedback);

      const result = await feedbackService.createFeedback(
        userId,
        tripId,
        rating,
        comments
      );

      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(userId);
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(tripId);
      expect(MockedFeedback).toHaveBeenCalledWith({
        user_id: mockUserId,
        trip_id: mockTripId,
        rating,
        comments,
      });
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedFeedback);
    });

    it("should create and save feedback successfully without comments", async () => {
      const feedbackData = {
        user_id: mockUserId,
        trip_id: mockTripId,
        rating,
        comments: undefined,
      };
      const savedFeedback = { ...feedbackData, _id: "feedback789" };
      mockSave.mockResolvedValue(savedFeedback);

      const result = await feedbackService.createFeedback(
        userId,
        tripId,
        rating
      );

      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(userId);
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(tripId);
      expect(MockedFeedback).toHaveBeenCalledWith({
        user_id: mockUserId,
        trip_id: mockTripId,
        rating,
        comments: undefined,
      });
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedFeedback);
    });

    it("should throw an error if saving feedback fails", async () => {
      const error = new Error("Database save failed");
      mockSave.mockRejectedValue(error);

      await expect(
        feedbackService.createFeedback(userId, tripId, rating, comments)
      ).rejects.toThrow(`Failed to save feedback: ${error.message}`);

      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(userId);
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(tripId);
      expect(MockedFeedback).toHaveBeenCalledWith({
        user_id: mockUserId,
        trip_id: mockTripId,
        rating,
        comments,
      });
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it("should throw an error with non-Error object", async () => {
      const error = "Database save failed string";
      mockSave.mockRejectedValue(error);

      await expect(
        feedbackService.createFeedback(userId, tripId, rating, comments)
      ).rejects.toThrow(`Failed to save feedback: ${error}`);

      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe("getFeedbackByTrip", () => {
    const tripId = "trip456";
    const mockTripId = { toString: () => tripId, equals: jest.fn() };

    beforeEach(() => {
      mockMongooseObjectId.mockReturnValue(mockTripId);
    });

    it("should fetch feedback for a given trip ID", async () => {
      const mockFeedback = [{ _id: "fb1" }, { _id: "fb2" }];
      mockPopulate.mockResolvedValue(mockFeedback);

      const result = await feedbackService.getFeedbackByTrip(tripId);

      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(tripId);
      expect(MockedFeedback.find).toHaveBeenCalledWith({ trip_id: mockTripId });
      expect(mockPopulate).toHaveBeenCalledWith("user_id", "name email");
      expect(result).toEqual(mockFeedback);
    });

    it("should throw an error if fetching feedback fails", async () => {
      const error = new Error("Database find failed");
      mockPopulate.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackByTrip(tripId)).rejects.toThrow(
        `Failed to fetch feedback: ${error.message}`
      );

      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(tripId);
      expect(MockedFeedback.find).toHaveBeenCalledWith({ trip_id: mockTripId });
      expect(mockPopulate).toHaveBeenCalledWith("user_id", "name email");
    });

    it("should throw an error with non-Error object during fetch", async () => {
      const error = "Database find failed string";
      mockPopulate.mockRejectedValue(error);

      await expect(feedbackService.getFeedbackByTrip(tripId)).rejects.toThrow(
        `Failed to fetch feedback: ${error}`
      );
      expect(mockPopulate).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUserFeedback", () => {
    const userId = "user123";
    const mockUserId = { toString: () => userId, equals: jest.fn() };

    beforeEach(() => {
      mockMongooseObjectId.mockReturnValue(mockUserId);
    });

    it("should fetch feedback for a given user ID", async () => {
      const mockFeedback = [{ _id: "fb1" }, { _id: "fb2" }];
      mockPopulate.mockResolvedValue(mockFeedback);

      const result = await feedbackService.getUserFeedback(userId);

      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(userId);
      expect(MockedFeedback.find).toHaveBeenCalledWith({ user_id: mockUserId });
      expect(mockPopulate).toHaveBeenCalledWith("trip_id");
      expect(result).toEqual(mockFeedback);
    });

    it("should throw an error if fetching user feedback fails", async () => {
      const error = new Error("Database find failed for user");
      mockPopulate.mockRejectedValue(error);

      await expect(feedbackService.getUserFeedback(userId)).rejects.toThrow(
        `Failed to fetch user feedback: ${error.message}`
      );

      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(userId);
      expect(MockedFeedback.find).toHaveBeenCalledWith({ user_id: mockUserId });
      expect(mockPopulate).toHaveBeenCalledWith("trip_id");
    });

    it("should throw an error with non-Error object during user feedback fetch", async () => {
      const error = "Database find failed string for user";
      mockPopulate.mockRejectedValue(error);

      await expect(feedbackService.getUserFeedback(userId)).rejects.toThrow(
        `Failed to fetch user feedback: ${error}`
      );
      expect(mockPopulate).toHaveBeenCalledTimes(1);
    });
  });
});
