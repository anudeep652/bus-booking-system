import type { Request, Response, RequestParamHandler } from "express";
import { FeedbackService } from "../services/FeedbackService";

const feedbackService = new FeedbackService();

export const submitFeedback = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const { tripId, rating, comments } = req.body;
    // @ts-ignore
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!tripId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Trip ID and rating are required",
      });
    }

    const feedback = await feedbackService.createFeedback(
      userId,
      tripId,
      rating,
      comments
    );

    return res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to submit feedback",
    });
  }
};

export const getTripFeedback = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const { tripId } = req.params;

    const feedback = await feedbackService.getFeedbackByTrip(tripId);

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get feedback",
    });
  }
};

export const getUserFeedback = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    // @ts-ignore
    const userId = req.params.userId || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const feedback = await feedbackService.getUserFeedback(userId);

    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get user feedback",
    });
  }
};
