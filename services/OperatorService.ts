import { Trip, Booking } from "../models/index";

class OperatorService {
  /**
   * Creates a new trip
   * @param tripData The trip data to create
   * @returns The created trip
   * @throws Error if trip creation fails
   */
  async createTrip(tripData: any) {
    try {
      const trip = await Trip.create(tripData);
      return trip;
    } catch (error) {
      throw new Error(
        `Failed to create trip: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  /**
   * Updates an existing trip
   * @param tripId The ID of the trip to update
   * @param updateData The data to update the trip with
   * @returns The updated trip
   * @throws Error if trip update fails or trip not found
   */
  async updateTrip(tripId: string, updateData: any) {
    try {
      const updatedTrip = await Trip.findByIdAndUpdate(tripId, updateData, {
        new: true,
      });

      if (!updatedTrip) {
        throw new Error(`Trip with ID ${tripId} not found`);
      }

      return updatedTrip;
    } catch (error) {
      throw new Error(
        `Failed to update trip: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  /**
   * Cancels/deletes a trip
   * @param tripId The ID of the trip to cancel
   * @returns The deleted trip
   * @throws Error if trip deletion fails or trip not found
   */
  async cancelTrip(tripId: string) {
    try {
      const deletedTrip = await Trip.findByIdAndDelete(tripId);

      if (!deletedTrip) {
        throw new Error(`Trip with ID ${tripId} not found`);
      }

      return deletedTrip;
    } catch (error) {
      throw new Error(
        `Failed to cancel trip: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  /**
   * Gets bookings for an operator
   * @param bus_id Optional bus ID to filter bookings
   * @returns The bookings for the operator
   * @throws Error if fetching bookings fails
   */
  async getOperatorBookings(bus_id?: string) {
    try {
      if (bus_id) {
        const trips = await Trip.find({ bus_id });

        if (!trips || trips.length === 0) {
          return [];
        }

        const tripIds = trips.map((trip) => trip._id);
        const bookings = await Booking.find({
          trip_id: { $in: tripIds },
        }).populate("trip_id");

        return bookings;
      } else {
        const bookings = await Booking.find().populate("trip_id");
        return bookings;
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch operator bookings: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}

export default OperatorService;
