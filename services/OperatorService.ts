import { Trip } from "../models/tripSchema.ts";
import { Booking } from "../models/bookingSchema.ts";

export const createTrip = async (tripData:any) => {
  const trip = await Trip.create(tripData);
  return trip;
};

export const updateTrip = async (tripId:string, updateData:any) => {
  const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, {
    new: true,
  });
  return updatedTrip;
};

export const cancelTrip = async (tripId:string) => {
  const deletedTrip = await Trip.findByIdAndDelete(tripId);
  return deletedTrip;
};

export const getOperatorBookings = async (bus_id:string) => {
  if (bus_id) {
    const trips = await Trip.find({ bus_id });
    const tripIds = trips.map((trip) => trip._id);
    const bookings = await Booking.find({ trip_id: { $in: tripIds } }).populate(
      "trip_id",
    );
    return bookings;
  } else {
    const bookings = await Booking.find().populate("trip_id");
    return bookings;
  }
};
