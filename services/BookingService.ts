import { Booking } from "../models/bookingSchema.ts";
import { User } from "../models/userSchema.ts";
import { Trip } from "../models/tripSchema.ts"; 

export class BookingService {
  async getBookingHistory(requestedUserId: string) {
    try {
      const user = await User.findById(requestedUserId);
      if (!user) {
        throw new Error('User not found');
      }

      const bookings = await Booking.find({ user_id: requestedUserId })
        .populate('trip_id', 'name destination date price')
        .populate('user_id', 'name email'); 

      return bookings;
    } catch (error) {
            //@ts-ignore

      throw new Error(`Failed to fetch booking history: ${error.message}`);
    }
  }

  async createBooking(requestedUserId: string, bookingData: {
    trip_id: string;
    seat_numbers: number[];
  }) {
    try {
      const user = await User.findById(requestedUserId);
      if (!user) {
        throw new Error('User not found');
      }

      const trip = await Trip.findById(bookingData.trip_id);
      if (!trip) {
        throw new Error('Trip not found');
      }

      const newBooking = new Booking({
        user_id: requestedUserId,
        trip_id: bookingData.trip_id,
        seat_numbers: bookingData.seat_numbers,
        payment_status: 'pending',
        booking_status: 'confirmed'
      });

      await newBooking.save();

      await newBooking.populate('trip_id', 'name destination date price');
      await newBooking.populate('user_id', 'name email');

      return newBooking;
    } catch (error) {
            //@ts-ignore

      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  async cancelBooking(bookingId: string, requestedUserId: string) {
    try {
      const user = await User.findById(requestedUserId);
      if (!user) {
        throw new Error('User not found');
      }

      const booking = await Booking.findOneAndUpdate(
        { 
          _id: bookingId, 
          user_id: requestedUserId 
        },
        { 
          booking_status: 'cancelled',
          payment_status: 'failed'
        },
        { new: true }
      );

      if (!booking) {
        throw new Error('Booking not found or unauthorized');
      }

      return booking;
    } catch (error) {
            //@ts-ignore
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }
}