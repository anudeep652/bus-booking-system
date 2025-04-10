import mongoose from "mongoose";
import { FeedbackService } from "../../services/FeedbackService.ts";
import { Feedback } from "../../models/feedbackSchema.ts";

jest.mock("../../models/feedbackSchema", () => ({
  Feedback: {
    find: jest.fn(),
    save: jest.fn(),
  },
}));

describe("FeedbackService", () => {
  let feedbackService: FeedbackService;
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockTripId = "507f1f77bcf86cd799439022";

  beforeEach(() => {
    feedbackService = new FeedbackService();
    jest.clearAllMocks();
  });

  describe("createFeedback", () => {
    it("should create and return feedback", async () => {
      const mockFeedback = {
        _id: "mockFeedbackId",
        user_id: mockUserId,
        trip_id: mockTripId,
        rating: 5,
        comments: "Great trip!",
      };

      const saveSpy = jest.fn().mockResolvedValue(mockFeedback);
      jest
        .spyOn(mongoose.Types, "ObjectId")
        .mockImplementation((id) => id as any);

      (Feedback as any) = jest.fn().mockImplementation(() => {
        return {
          save: saveSpy,
        };
      });

      const result = await feedbackService.createFeedback(
        mockUserId,
        mockTripId,
        5,
        "Great trip!"
      );

      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockFeedback);
    });

    it("should throw an error if saving fails", async () => {
      const errorMessage = "Database error";
      const saveSpy = jest.fn().mockRejectedValue(new Error(errorMessage));
      jest
        .spyOn(mongoose.Types, "ObjectId")
        .mockImplementation((id) => id as any);

      (Feedback as any) = jest.fn().mockImplementation(() => {
        return {
          save: saveSpy,
        };
      });

      await expect(
        feedbackService.createFeedback(mockUserId, mockTripId, 5, "Great trip!")
      ).rejects.toThrow(`Failed to save feedback: ${errorMessage}`);
    });
  });

  describe("getFeedbackByTrip", () => {
    it("should return feedback for a specific trip", async () => {
      const mockFeedbackList = [
        {
          _id: "mockFeedbackId1",
          user_id: mockUserId,
          trip_id: mockTripId,
          rating: 5,
        },
        {
          _id: "mockFeedbackId2",
          user_id: "anotherUserId",
          trip_id: mockTripId,
          rating: 4,
        },
      ];

      const mockPopulate = jest.fn().mockResolvedValue(mockFeedbackList);
      const mockFind = jest.fn().mockReturnValue({ populate: mockPopulate });
      (Feedback.find as jest.Mock).mockImplementation(mockFind);
      jest
        .spyOn(mongoose.Types, "ObjectId")
        .mockImplementation((id) => id as any);

      const result = await feedbackService.getFeedbackByTrip(mockTripId);

      expect(Feedback.find).toHaveBeenCalledWith({ trip_id: mockTripId });
      expect(mockPopulate).toHaveBeenCalledWith("user_id", "name email");
      expect(result).toEqual(mockFeedbackList);
    });

    it("should throw an error if finding fails", async () => {
      const errorMessage = "Database error";
      (Feedback.find as jest.Mock).mockImplementation(() => {
        throw new Error(errorMessage);
      });
      jest
        .spyOn(mongoose.Types, "ObjectId")
        .mockImplementation((id) => id as any);

      await expect(
        feedbackService.getFeedbackByTrip(mockTripId)
      ).rejects.toThrow(`Failed to fetch feedback: ${errorMessage}`);
    });
  });

  describe("getUserFeedback", () => {
    it("should return feedback for a specific user", async () => {
      const mockFeedbackList = [
        {
          _id: "mockFeedbackId1",
          user_id: mockUserId,
          trip_id: mockTripId,
          rating: 5,
        },
        {
          _id: "mockFeedbackId2",
          user_id: mockUserId,
          trip_id: "anotherTripId",
          rating: 3,
        },
      ];

      const mockPopulate = jest.fn().mockResolvedValue(mockFeedbackList);
      const mockFind = jest.fn().mockReturnValue({ populate: mockPopulate });
      (Feedback.find as jest.Mock).mockImplementation(mockFind);
      jest
        .spyOn(mongoose.Types, "ObjectId")
        .mockImplementation((id) => id as any);

      const result = await feedbackService.getUserFeedback(mockUserId);

      expect(Feedback.find).toHaveBeenCalledWith({ user_id: mockUserId });
      expect(mockPopulate).toHaveBeenCalledWith("trip_id");
      expect(result).toEqual(mockFeedbackList);
    });

    it("should throw an error if finding fails", async () => {
      const errorMessage = "Database error";
      (Feedback.find as jest.Mock).mockImplementation(() => {
        throw new Error(errorMessage);
      });
      jest
        .spyOn(mongoose.Types, "ObjectId")
        .mockImplementation((id) => id as any);

      await expect(feedbackService.getUserFeedback(mockUserId)).rejects.toThrow(
        `Failed to fetch user feedback: ${errorMessage}`
      );
    });
  });
});
