import { User, Trip, Booking } from "../models/index";
import mongoose from "mongoose";

export class BookingService {
  async getBookingHistory(requestedUserId: string) {
    try {
      const user = await User.findById(requestedUserId);
      if (!user) {
        throw new Error("User not found");
      }

      const bookings = await Booking.find({ user_id: requestedUserId })
        .populate("trip_id", "name destination date price")
        .populate("user_id", "name email");

      return bookings;
    } catch (error) {
      throw new Error(
        `Failed to fetch booking history: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async createBooking(
    requestedUserId: string,
    bookingData: {
      trip_id: string;
      seat_numbers: number[];
    }
  ) {
    try {
      const user = await User.findById(requestedUserId);
      if (!user) {
        throw new Error("User not found");
      }

      const trip = await Trip.findById(bookingData.trip_id);
      if (!trip) {
        throw new Error("Trip not found");
      }

      const newBooking = new Booking({
        user_id: requestedUserId,
        trip_id: bookingData.trip_id,
        seats: bookingData.seat_numbers.map((n) => ({
          seat_number: n,
          status: "booked",
        })),
        payment_status: "pending",
        booking_status: "confirmed",
      });

      await newBooking.save();

      await newBooking.populate("trip_id", "name destination date price");
      await newBooking.populate("user_id", "name email");

      return newBooking;
    } catch (error) {
      throw new Error(
        `Failed to create booking: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async cancelBooking(bookingId: string, requestedUserId: string) {
    try {
      const user = await User.findById(requestedUserId);
      if (!user) {
        throw new Error("User not found");
      }

      const booking = await Booking.findOneAndUpdate(
        {
          _id: bookingId,
          user_id: requestedUserId,
        },
        {
          booking_status: "cancelled",
          payment_status: "failed",
        },
        { new: true }
      );

      if (!booking) {
        throw new Error("Booking not found or unauthorized");
      }

      return booking;
    } catch (error) {
      throw new Error(
        `Failed to cancel booking: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async cancelSeats(bookingId: string, seats: [number]) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new Error("Booking not found");

      const trip = await Trip.findById(booking.trip_id).session(session);
      if (!trip) throw new Error("Trip not found");

      let cancelledCount = 0;

      booking.seats.forEach((seat) => {
        if (seats.includes(seat.seat_number) && seat.status === "booked") {
          seat.status = "cancelled";
          cancelledCount++;
        }
      });

      if (cancelledCount === 0) {
        throw new Error("No valid seats to cancel");
      }

      const remainingActiveSeats = booking.seats.filter(
        (seat) => seat.status === "booked"
      ).length;

      if (remainingActiveSeats === 0) {
        booking.booking_status = "cancelled";
        booking.payment_status = "refunded";
      } else {
        booking.booking_status = "partially_cancelled";
        booking.payment_status = "partially_refunded";
      }

      trip.available_seats += cancelledCount;

      await booking.save();
      await trip.save();

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
