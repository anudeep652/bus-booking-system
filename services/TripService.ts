import { Trip } from "../models/tripSchema.ts";

class TripService {
  async getAllTrips(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    trips: any[];
    totalTrips: number;
    totalPages: number;
  }> {
    try {
      const trips = await Trip.find()
        .populate("bus_id", "bus_number bus_type") // Select specific bus fields
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ departure_time: -1 });

      const totalTrips = await Trip.countDocuments();
      const totalPages = Math.ceil(totalTrips / limit);

      return {
        trips,
        totalTrips,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Error fetching trips: ${error.message as string}`);
    }
  }

  async cancelTrip(tripId: string): Promise<any> {
    try {
      const trip = await Trip.findById(tripId);

      if (!trip) {
        throw new Error("Trip not found");
      }

      const cancelledTrip = await Trip.findByIdAndUpdate(
        tripId,
        {
          status: "cancelled",
          available_seats: 0, // Ensure no more bookings can be made
        },
        { new: true },
      );

      return cancelledTrip;
    } catch (error) {
      throw new Error(`Error cancelling trip: ${error.message}`);
    }
  }

  async getTripById(tripId: string): Promise<any> {
    try {
      const trip = await Trip.findById(tripId).populate(
        "bus_id",
        "bus_number bus_type capacity",
      );

      if (!trip) {
        throw new Error("Trip not found");
      }

      return trip;
    } catch (error) {
      throw new Error(`Error fetching trip details: ${error.message}`);
    }
  }

  // Filter trips with advanced search
  async filterTrips(filters: {
    source?: string;
    destination?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.source) {
        query.source = { $regex: filters.source, $options: "i" };
      }

      if (filters.destination) {
        query.destination = { $regex: filters.destination, $options: "i" };
      }

      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }

      if (filters.startDate || filters.endDate) {
        query.departure_time = {};
        if (filters.startDate) query.departure_time.$gte = filters.startDate;
        if (filters.endDate) query.departure_time.$lte = filters.endDate;
      }

      return await Trip.find(query).populate("bus_id", "bus_number bus_type");
    } catch (error) {
      throw new Error(`Error filtering trips: ${error.message}`);
    }
  }
}

export default new TripService();
