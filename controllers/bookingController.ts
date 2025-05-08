import type { Request, Response } from "express";
import { BookingService } from "../services/BookingService";
import { IRequestWithMiddlewareUser } from "../types";

const bookingService = new BookingService();
export const getBookingHistory = async (
  req: IRequestWithMiddlewareUser,
  res: Response
) => {
  try {
    const { userId: requestedUserId } = req.user;

    const bookings = await bookingService.getBookingHistory(requestedUserId);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Booking history retrieval error:", error);
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get booking history, Unknown error occured: " + error,
    });
  }
};

export const createBooking = async (
  req: IRequestWithMiddlewareUser,
  res: Response
) => {
  try {
    const { userId: requestedUserId } = req.user;

    const { trip_id, seat_numbers } = req.body;

    const newBooking = await bookingService.createBooking(requestedUserId, {
      trip_id,
      seat_numbers,
    });

    res.status(201).json({
      success: true,
      data: newBooking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create booking,Unknown error occured: " + error,
    });
  }
};

export const cancelBooking = async (
  req: IRequestWithMiddlewareUser,
  res: Response
) => {
  try {
    const { id: requestedUserId } = req.params;

    const { bookingId } = req.params;

    const cancelledBooking = await bookingService.cancelBooking(
      bookingId,
      requestedUserId
    );

    res.status(200).json({
      success: true,
      data: cancelledBooking,
    });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel booking, Unknown error occured: " + error,
    });
  }
};

export const cancelSeats = async (
  req: IRequestWithMiddlewareUser,
  res: Response
) => {
  try {
    const { seat_numbers, bookingId } = req.body;

    const cancelSeat = await bookingService.cancelSeats(
      bookingId,
      seat_numbers
    );
    res.status(200).json({
      success: true,
      data: cancelSeat,
    });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel booking, Unknown error occured: " + error,
    });
  }
};
