import { Trip } from "../models/index";

export class TripService {
  async getAllTrips(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    trips: any[];
    totalTrips: number;
    totalPages: number;
  }> {
    try {
      const trips = await Trip.find()
        .populate("bus_id", "bus_number bus_type")
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
      throw new Error(
        `Error fetching trips: ${
          error instanceof Error ? error.message : error
        }`
      );
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
          available_seats: 0,
        },
        { new: true }
      );

      return cancelledTrip;
    } catch (error) {
      throw new Error(
        `Error cancelling trip: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async getTripById(tripId: string): Promise<any> {
    try {
      const trip = await Trip.findById(tripId).populate(
        "bus_id",
        "bus_number bus_type capacity"
      );

      if (!trip) {
        throw new Error("Trip not found");
      }

      return trip;
    } catch (error) {
      throw new Error(
        `Error fetching trip details: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async filterTrips(filters: {
    source?: string;
    destination?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: Date | string;
    endDate?: Date | string;
    busType?: string;
    ratings?: number;
  }): Promise<any[]> {
    try {
      const busTypes =
        filters.busType?.split(",").map((type) => type.trim()) || [];
      const busTypeValues = busTypes.filter(
        (type) => type !== "ac" && type !== "nonAc"
      );
      const hasAcFilter = busTypes.includes("ac") || busTypes.includes("nonAc");

      const pipeline: any[] = [
        {
          $lookup: {
            from: "buses",
            localField: "bus_id",
            foreignField: "_id",
            as: "busDetail",
          },
        },
        {
          $unwind: {
            path: "$busDetail",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {} as any,
        },
      ];

      const matchStage = pipeline[2].$match;

      if (filters.source) {
        matchStage.source = { $regex: filters.source, $options: "i" };
      }
      if (filters.destination) {
        matchStage.destination = { $regex: filters.destination, $options: "i" };
      }
      if (filters.minPrice || filters.maxPrice) {
        matchStage.price = {};
        if (filters.minPrice) matchStage.price.$gte = Number(filters.minPrice);
        if (filters.maxPrice) matchStage.price.$lte = Number(filters.maxPrice);
      }
      if (filters.ratings) {
        matchStage.ratings = { $gte: Number(filters.ratings) };
      }

      if (filters.startDate) {
        const startDateTime = new Date(filters.startDate);
        if (!matchStage.departure_time) matchStage.departure_time = {};
        matchStage.departure_time.$gte = startDateTime;
      }

      if (filters.endDate) {
        const endDateTime = new Date(filters.endDate);
        if (!matchStage.arrival_time) matchStage.arrival_time = {};
        matchStage.arrival_time.$lte = endDateTime;
      }

      if (hasAcFilter) {
        const acFilterlength = busTypes.length - busTypeValues.length;
        if (acFilterlength === 1 && busTypes.includes("ac")) {
          matchStage["busDetail.hasAC"] = true;
        } else if (acFilterlength === 1 && busTypes.includes("nonAc")) {
          matchStage["busDetail.hasAC"] = false;
        }
      }

      if (busTypeValues.length > 0) {
        matchStage["busDetail.bus_type"] = { $in: busTypeValues };
      }

      pipeline.push({
        $project: {
          _id: 1,
          source: 1,
          destination: 1,
          price: 1,
          hasAC: 1,
          ratings: 1,
          departure_time: 1,
          arrival_time: 1,
          bus_id: {
            _id: "$busDetail._id",
            bus_number: "$busDetail.bus_number",
            bus_type: "$busDetail.bus_type",
          },
        },
      });

      console.log(
        "MongoDB aggregation pipeline:",
        JSON.stringify(pipeline, null, 2)
      );

      const trips = await Trip.aggregate(pipeline);

      return trips;
    } catch (error) {
      throw new Error(
        `Error filtering trips: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
