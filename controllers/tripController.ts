import type { Request, RequestParamHandler, Response } from "express";
import { TripService } from "../services/TripService";

const tripService = new TripService();

export const searchTrips = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    console.log(req.params);
    const trips = await tripService.filterTrips(req.query);
    res.status(200).json({
      success: true,
      data: trips.map((trip) => ({
        id: trip._id,
        busId: trip.bus_id._id,
        busNumber: trip.bus_id.bus_number,
        busType: trip.bus_id.bus_type,
        departureTime: trip.departure_time,
        arrivalTime: trip.arrival_time,
        price: trip.price,
        availableSeats: trip.available_seats,
        source: trip.source,
        destination: trip.destination,
      })),
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

export const getTripDetail = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const trip = await tripService.getTripById(req.params.tripId);
    res.status(200).json({ trip });
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
