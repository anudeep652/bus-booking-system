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

  // created a unique index on trip_id and seat_number to prevent duplicate bookings
  // db.bookings.createIndex( { trip_id: 1, "seats.seat_number": 1 }, { unique: true, partialFilterExpression: { "seats.status": "booked" } } );

  async createBooking(
    requestedUserId: string,
    bookingData: { trip_id: string; seat_numbers: number[] }
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(requestedUserId).session(session);
      if (!user) throw new Error("User not found");

      const seatsRequested = bookingData.seat_numbers.length;
      const conflict = await Booking.findOne({
        user_id: requestedUserId,
        trip_id: bookingData.trip_id,
        "seats.seat_number": { $in: bookingData.seat_numbers },
        booking_status: "confirmed",
      }).session(session);

      if (conflict) {
        throw new Error("You've already booked one or more of those seats");
      }

      const trip = await Trip.findOneAndUpdate(
        { _id: bookingData.trip_id, available_seats: { $gte: seatsRequested } },
        { $inc: { available_seats: -seatsRequested } },
        { new: true, session }
      );
      if (!trip) {
        const exists = await Trip.exists({ _id: bookingData.trip_id }).session(
          session
        );
        throw new Error(
          exists ? "Not enough seats available" : "Trip not found"
        );
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
      await newBooking.save({ session });

      await session.commitTransaction();
      await newBooking.populate(
        "trip_id",
        "bus_id source destination departure_time price"
      );
      await newBooking.populate("user_id", "name email");
      return newBooking;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(
        `Booking failed: ${err instanceof Error ? err.message : err}`
      );
    } finally {
      session.endSession();
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
