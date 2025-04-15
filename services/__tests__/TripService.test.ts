import tripService from "../../services/TripService";
import { Trip } from "../../models/tripSchema";

jest.mock("../../models/tripSchema");

const MockedTrip = Trip as jest.Mocked<typeof Trip>;

describe("TripService", () => {
  let mockFind: jest.Mock;
  let mockPopulate: jest.Mock;
  let mockSkip: jest.Mock;
  let mockLimit: jest.Mock;
  let mockSort: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByIdAndUpdate: jest.Mock;
  let mockCountDocuments: jest.Mock;
  let mockChain: {
    populate: jest.Mock;
    skip: jest.Mock;
    limit: jest.Mock;
    sort: jest.Mock;
  };
  let mockFindByIdChain: {
    populate: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPopulate = jest.fn();
    mockSkip = jest.fn();
    mockLimit = jest.fn();
    mockSort = jest.fn();
    mockFindById = jest.fn();
    mockFindByIdAndUpdate = jest.fn();
    mockCountDocuments = jest.fn();

    mockChain = {
      populate: mockPopulate.mockReturnThis(),
      skip: mockSkip.mockReturnThis(),
      limit: mockLimit.mockReturnThis(),
      sort: mockSort,
    };

    mockFindByIdChain = {
      populate: mockPopulate,
    };

    mockFind = jest.fn(() => mockChain);
    mockFindById.mockReturnValue(mockFindByIdChain);

    MockedTrip.find = mockFind;
    MockedTrip.findById = mockFindById;
    MockedTrip.findByIdAndUpdate = mockFindByIdAndUpdate;
    MockedTrip.countDocuments = mockCountDocuments;
  });

  describe("getAllTrips", () => {
    const mockTrips = [{ _id: "1" }, { _id: "2" }];
    const totalTrips = 15;
    const limit = 10;
    const page = 1;
    const totalPages = Math.ceil(totalTrips / limit);

    it("should fetch all trips with default pagination", async () => {
      mockSort.mockResolvedValue(mockTrips);
      mockCountDocuments.mockResolvedValue(totalTrips);

      const result = await tripService.getAllTrips();

      expect(MockedTrip.find).toHaveBeenCalledTimes(1);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(mockSkip).toHaveBeenCalledWith((page - 1) * limit);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(mockSort).toHaveBeenCalledWith({ departure_time: -1 });
      expect(MockedTrip.countDocuments).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        trips: mockTrips,
        totalTrips,
        totalPages,
      });
    });

    it("should fetch trips with specific pagination", async () => {
      const customPage = 2;
      const customLimit = 5;
      const customTotalPages = Math.ceil(totalTrips / customLimit);
      mockSort.mockResolvedValue(mockTrips);
      mockCountDocuments.mockResolvedValue(totalTrips);

      const result = await tripService.getAllTrips(customPage, customLimit);

      expect(MockedTrip.find).toHaveBeenCalledTimes(1);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(mockSkip).toHaveBeenCalledWith((customPage - 1) * customLimit);
      expect(mockLimit).toHaveBeenCalledWith(customLimit);
      expect(mockSort).toHaveBeenCalledWith({ departure_time: -1 });
      expect(MockedTrip.countDocuments).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        trips: mockTrips,
        totalTrips,
        totalPages: customTotalPages,
      });
    });

    it("should throw an error if Trip.find fails", async () => {
      const error = new Error("Find failed");
      mockSort.mockRejectedValue(error);
      mockCountDocuments.mockResolvedValue(totalTrips);

      await expect(tripService.getAllTrips()).rejects.toThrow(
        `Error fetching trips: ${error.message}`
      );
      expect(MockedTrip.find).toHaveBeenCalledTimes(1);
      expect(mockCountDocuments).not.toHaveBeenCalled();
    });

    it("should throw an error if Trip.countDocuments fails", async () => {
      const error = new Error("Count failed");
      mockSort.mockResolvedValue(mockTrips);
      mockCountDocuments.mockRejectedValue(error);

      await expect(tripService.getAllTrips()).rejects.toThrow(
        `Error fetching trips: ${error.message}`
      );
      expect(MockedTrip.find).toHaveBeenCalledTimes(1);
      expect(mockSort).toHaveBeenCalledTimes(1);
      expect(mockCountDocuments).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if fetching fails with non-Error", async () => {
      const error = "Database fetch failed string";
      mockSort.mockRejectedValue(error);
      mockCountDocuments.mockResolvedValue(totalTrips);

      await expect(tripService.getAllTrips()).rejects.toThrow(
        `Error fetching trips: ${error}`
      );
    });
  });

  describe("cancelTrip", () => {
    const tripId = "trip123";
    const mockTrip = { _id: tripId, status: "scheduled" };
    const mockCancelledTrip = {
      _id: tripId,
      status: "cancelled",
      available_seats: 0,
    };

    it("should cancel a trip successfully", async () => {
      mockFindById.mockResolvedValue(mockTrip);
      mockFindByIdAndUpdate.mockResolvedValue(mockCancelledTrip);

      const result = await tripService.cancelTrip(tripId);

      expect(MockedTrip.findById).toHaveBeenCalledWith(tripId);
      expect(MockedTrip.findByIdAndUpdate).toHaveBeenCalledWith(
        tripId,
        { status: "cancelled", available_seats: 0 },
        { new: true }
      );
      expect(result).toEqual(mockCancelledTrip);
    });

    it("should throw an error if trip is not found during findById", async () => {
      mockFindById.mockResolvedValue(null);

      await expect(tripService.cancelTrip(tripId)).rejects.toThrow(
        `Error cancelling trip: Trip not found`
      );
      expect(MockedTrip.findById).toHaveBeenCalledWith(tripId);
      expect(MockedTrip.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if Trip.findById fails", async () => {
      const error = new Error("FindById failed");
      mockFindById.mockRejectedValue(error);

      await expect(tripService.cancelTrip(tripId)).rejects.toThrow(
        `Error cancelling trip: ${error.message}`
      );
      expect(MockedTrip.findById).toHaveBeenCalledWith(tripId);
      expect(MockedTrip.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if Trip.findByIdAndUpdate fails", async () => {
      const error = new Error("Update failed");
      mockFindById.mockResolvedValue(mockTrip);
      mockFindByIdAndUpdate.mockRejectedValue(error);

      await expect(tripService.cancelTrip(tripId)).rejects.toThrow(
        `Error cancelling trip: ${error.message}`
      );
      expect(MockedTrip.findById).toHaveBeenCalledWith(tripId);
      expect(MockedTrip.findByIdAndUpdate).toHaveBeenCalledWith(
        tripId,
        { status: "cancelled", available_seats: 0 },
        { new: true }
      );
    });

    it("should throw an error if cancelling fails with non-Error", async () => {
      const error = "Database cancel failed string";
      mockFindById.mockResolvedValue(mockTrip);
      mockFindByIdAndUpdate.mockRejectedValue(error);

      await expect(tripService.cancelTrip(tripId)).rejects.toThrow(
        `Error cancelling trip: ${error}`
      );
    });
  });

  describe("getTripById", () => {
    const tripId = "trip123";
    const mockTrip = {
      _id: tripId,
      source: "A",
      destination: "B",
      bus_id: { bus_number: "1", bus_type: "AC", capacity: 30 },
    };

    it("should fetch trip details successfully", async () => {
      mockPopulate.mockResolvedValue(mockTrip);

      const result = await tripService.getTripById(tripId);

      expect(MockedTrip.findById).toHaveBeenCalledWith(tripId);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type capacity"
      );
      expect(result).toEqual(mockTrip);
    });

    it("should throw an error if trip is not found", async () => {
      mockPopulate.mockResolvedValue(null);

      await expect(tripService.getTripById(tripId)).rejects.toThrow(
        `Error fetching trip details: Trip not found`
      );
      expect(MockedTrip.findById).toHaveBeenCalledWith(tripId);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type capacity"
      );
    });

    it("should throw an error if Trip.findById/populate fails", async () => {
      const error = new Error("FindById/Populate failed");
      mockPopulate.mockRejectedValue(error);

      await expect(tripService.getTripById(tripId)).rejects.toThrow(
        `Error fetching trip details: ${error.message}`
      );
      expect(MockedTrip.findById).toHaveBeenCalledWith(tripId);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type capacity"
      );
    });

    it("should throw an error if fetching details fails with non-Error", async () => {
      const error = "Database find failed string";
      mockPopulate.mockRejectedValue(error);

      await expect(tripService.getTripById(tripId)).rejects.toThrow(
        `Error fetching trip details: ${error}`
      );
    });
  });

  describe("filterTrips", () => {
    const mockTrips = [
      { _id: "1", price: 100 },
      { _id: "2", price: 150 },
    ];

    beforeEach(() => {
      mockFind = jest.fn(() => ({ populate: mockPopulate }));
      MockedTrip.find = mockFind;
    });

    it("should filter trips based on source and destination", async () => {
      const filters = { source: "CityA", destination: "CityB" };
      const expectedQuery = {
        source: { $regex: filters.source, $options: "i" },
        destination: { $regex: filters.destination, $options: "i" },
      };
      mockPopulate.mockResolvedValue(mockTrips);

      const result = await tripService.filterTrips(filters);

      expect(MockedTrip.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockTrips);
    });

    it("should filter trips based on price range", async () => {
      const filters = { minPrice: 50, maxPrice: 120 };
      const expectedQuery = {
        price: { $gte: filters.minPrice, $lte: filters.maxPrice },
      };
      mockPopulate.mockResolvedValue(mockTrips);

      const result = await tripService.filterTrips(filters);

      expect(MockedTrip.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockTrips);
    });

    it("should filter trips based only on minPrice", async () => {
      const filters = { minPrice: 100 };
      const expectedQuery = {
        price: { $gte: filters.minPrice },
      };
      mockPopulate.mockResolvedValue(mockTrips);

      const result = await tripService.filterTrips(filters);

      expect(MockedTrip.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockTrips);
    });

    it("should filter trips based on date range", async () => {
      const startDate = new Date("2025-04-15");
      const endDate = new Date("2025-04-20");
      const filters = { startDate, endDate };
      const expectedQuery = {
        departure_time: { $gte: filters.startDate, $lte: filters.endDate },
      };
      mockPopulate.mockResolvedValue(mockTrips);

      const result = await tripService.filterTrips(filters);

      expect(MockedTrip.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockTrips);
    });

    it("should filter trips based only on startDate", async () => {
      const startDate = new Date("2025-04-15");
      const filters = { startDate };
      const expectedQuery = {
        departure_time: { $gte: filters.startDate },
      };
      mockPopulate.mockResolvedValue(mockTrips);

      const result = await tripService.filterTrips(filters);

      expect(MockedTrip.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockTrips);
    });

    it("should handle combined filters", async () => {
      const startDate = new Date("2025-04-15");
      const filters = { source: "CityC", maxPrice: 200, startDate };
      const expectedQuery = {
        source: { $regex: filters.source, $options: "i" },
        price: { $lte: filters.maxPrice },
        departure_time: { $gte: filters.startDate },
      };
      mockPopulate.mockResolvedValue(mockTrips);

      const result = await tripService.filterTrips(filters);

      expect(MockedTrip.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockTrips);
    });

    it("should return all trips if no filters are provided", async () => {
      const filters = {};
      const expectedQuery = {};
      mockPopulate.mockResolvedValue(mockTrips);

      const result = await tripService.filterTrips(filters);

      expect(MockedTrip.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockTrips);
    });

    it("should throw an error if filtering fails", async () => {
      const filters = { source: "CityA" };
      const error = new Error("Filter failed");
      mockPopulate.mockRejectedValue(error);

      await expect(tripService.filterTrips(filters)).rejects.toThrow(
        `Error filtering trips: ${error.message}`
      );
      expect(MockedTrip.find).toHaveBeenCalledWith({
        source: { $regex: filters.source, $options: "i" },
      });
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
    });

    it("should throw an error if filtering fails with non-Error", async () => {
      const filters = { source: "CityA" };
      const error = "Database filter failed string";
      mockPopulate.mockRejectedValue(error);

      await expect(tripService.filterTrips(filters)).rejects.toThrow(
        `Error filtering trips: ${error}`
      );
    });
  });
});
