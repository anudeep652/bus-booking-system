import { Feedback } from "../models/index.ts";
import mongoose from "mongoose";

export class FeedbackService {
  async createFeedback(
    userId: string,
    tripId: string,
    rating: number,
    comments?: string
  ) {
    try {
      const newFeedback = new Feedback({
        user_id: new mongoose.Types.ObjectId(userId),
        trip_id: new mongoose.Types.ObjectId(tripId),
        rating,
        comments,
      });

      const savedFeedback = await newFeedback.save();
      return savedFeedback;
    } catch (error) {
      throw new Error(
        `Failed to save feedback: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async getFeedbackByTrip(tripId: string) {
    try {
      const feedback = await Feedback.find({
        trip_id: new mongoose.Types.ObjectId(tripId),
      }).populate("user_id", "name email");

      return feedback;
    } catch (error) {
      throw new Error(
        `Failed to fetch feedback: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async getUserFeedback(userId: string) {
    try {
      const feedback = await Feedback.find({
        user_id: new mongoose.Types.ObjectId(userId),
      }).populate("trip_id");

      return feedback;
    } catch (error) {
      throw new Error(
        `Failed to fetch user feedback: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
