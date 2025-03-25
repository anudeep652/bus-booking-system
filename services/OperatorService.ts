import { Trip } from "../models/tripSchema.ts";
import { Booking } from "../models/bookingSchema.ts";

/**
 * Create a new trip using the Trip model.
 */
export const createTrip = async (tripData:any) => {
  const trip = await Trip.create(tripData);
  return trip;
};

/**
 * Update an existing trip.
 */
export const updateTrip = async (tripId:string, updateData:any) => {
  const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, {
    new: true,
  });
  return updatedTrip;
};

/**
 * Cancel a trip by deleting it
 */
export const cancelTrip = async (tripId:string) => {
  const deletedTrip = await Trip.findByIdAndDelete(tripId);
  return deletedTrip;
};

/**
 * Retrieve bookings for trips associated with an operator’s bus.
 * If a bus_id query parameter is provided, only bookings for trips associated with that bus will be returned.
 * Otherwise, all bookings are returned.
 */
export const getOperatorBookings = async (bus_id:string) => {
  if (bus_id) {
    // First, find trips associated with the given bus.
    const trips = await Trip.find({ bus_id });
    const tripIds = trips.map((trip) => trip._id);
    // Return bookings for those trips.
    const bookings = await Booking.find({ trip_id: { $in: tripIds } }).populate(
      "trip_id",
    );
    return bookings;
  } else {
    // No filtering provided, return all bookings (or adjust based on your needs).
    const bookings = await Booking.find().populate("trip_id");
    return bookings;
  }
};
