import type { Request, Response, RequestParamHandler } from "express";

import { AuthServiceFactory } from "../services/auth/AuthServiceFactory";
import OperatorService from "../services/OperatorService";

const operatorService = new OperatorService();

export const registerOperator = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  const authService = AuthServiceFactory.createAuthService("operator");
  const result = await authService.register(req.body);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
    user: {
      id: result.id,
      name: result.name,
      email: req.body.email,
    },
  });
};

export const loginOperator = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  const authService = AuthServiceFactory.createAuthService("operator");
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
    user: {
      id: result.id,
      name: result.name,
      email: email,
    },
  });
};

export const createTrip = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const tripData = req.body;
    const newTrip = await operatorService.createTrip(tripData);
    res.status(201).json({ success: true, data: newTrip });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create trip: " + error,
    });
  }
};

export const updateTrip = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const tripId = req.params.id;
    const updateData = req.body;
    const updatedTrip = await operatorService.updateTrip(tripId, updateData);
    if (!updatedTrip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });
    }
    res.status(200).json({ success: true, data: updatedTrip });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update trip: " + error,
    });
  }
};

export const cancelTrip = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const tripId = req.params.id;
    const cancelledTrip = await operatorService.cancelTrip(tripId);
    if (!cancelledTrip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });
    }
    res.status(200).json({ success: true, data: tripId });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel trip: " + error,
    });
  }
};

export const viewOperatorBookings = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const { bus_id } = req.query;
    const bookings = await operatorService.getOperatorBookings(
      (bus_id as string) ?? ""
    );
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error viewing operator bookings: " + error,
    });
  }
};
