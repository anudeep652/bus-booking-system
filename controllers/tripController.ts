import type { Request, RequestParamHandler, Response } from "express";
import { TripService } from "../services/TripService";

const tripService = new TripService();

export const searchTrips = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const trips = await tripService.filterTrips(req.query);
    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve user profile: " + error,
    });
  }
};
