import type { Request, Response } from "express";

import { AuthServiceFactory } from "../services/auth/AuthServiceFactory.ts";

import * as operatorService from "../services/OperatorService.ts";

export const registerOperator = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("operator");
  const result = await authService.register(req.body);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
  });
};

export const loginOperator = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("operator");
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
  });
};

/**
 * Create a new trip.
 */
export const createTrip = async (req:Request, res:Response) => {
  try {
    const tripData = req.body;
    const newTrip = await operatorService.createTrip(tripData);
    res.status(201).json(newTrip);
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Failed to create trip." });
  }
};

/**
 * Update trip details.
 */
export const updateTrip = async (req:Request, res:Response) => {
  try {
    const tripId = req.params.id;
    const updateData = req.body;
    const updatedTrip = await operatorService.updateTrip(tripId, updateData);
    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found." });
    }
    res.json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Failed to update trip." });
  }
};

/**
 * Cancel a trip.
 */
export const cancelTrip = async (req:Request, res:Response) => {
  try {
    const tripId = req.params.id;
    const cancelledTrip = await operatorService.cancelTrip(tripId);
    if (!cancelledTrip) {
      return res.status(404).json({ message: "Trip not found." });
    }
    res.json({ message: "Trip cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling trip:", error);
    res.status(500).json({ message: "Failed to cancel trip." });
  }
};

/**
 * View bookings.
 * Optionally, if a bus_id is provided as a query parameter,
 * return bookings only for trips associated with that bus.
 */
export const viewOperatorBookings = async (req:Request, res:Response) => {
  try {
    const { bus_id } = req.query;
    const bookings = await operatorService.getOperatorBookings(bus_id as string??"");
    res.json(bookings);
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    res.status(500).json({ message: "Failed to retrieve bookings." });
  }
};
