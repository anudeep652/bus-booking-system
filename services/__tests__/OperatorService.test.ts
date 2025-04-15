// @ts-nocheck
import OperatorService from "../../services/OperatorService";
import { Trip, Booking } from "../../models/index";

jest.mock("../../models/index", () => ({
  Trip: {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
  },
  Booking: {
    find: jest.fn(),
  },
}));

const MockedTrip = Trip as jest.Mocked<typeof Trip>;
const MockedBooking = Booking as jest.Mocked<typeof Booking>;

describe("OperatorService", () => {
  let operatorService: OperatorService;
  let mockPopulate: jest.Mock;
  let mockBookingFind: jest.Mock;

  beforeEach(() => {
    operatorService = new OperatorService();
    jest.clearAllMocks();

    mockPopulate = jest.fn();
    mockBookingFind = jest.fn(() => ({
      populate: mockPopulate,
    }));
    MockedBooking.find = mockBookingFind;
  });

  describe("createTrip", () => {
    const tripData = { name: "Test Trip", destination: "Test Destination" };

    it("should create a trip successfully", async () => {
      const createdTrip = { ...tripData, _id: "trip123" };
      MockedTrip.create.mockResolvedValue(createdTrip as any);

      const result = await operatorService.createTrip(tripData);

      expect(MockedTrip.create).toHaveBeenCalledWith(tripData);
      expect(result).toEqual(createdTrip);
    });

    it("should throw an error if trip creation fails", async () => {
      const error = new Error("Database error");
      MockedTrip.create.mockRejectedValue(error);

      await expect(operatorService.createTrip(tripData)).rejects.toThrow(
        `Failed to create trip: ${error.message}`
      );
      expect(MockedTrip.create).toHaveBeenCalledWith(tripData);
    });

    it("should throw an error if trip creation fails with non-Error", async () => {
      const error = "Database error string";
      MockedTrip.create.mockRejectedValue(error);

      await expect(operatorService.createTrip(tripData)).rejects.toThrow(
        `Failed to create trip: ${error}`
      );
      expect(MockedTrip.create).toHaveBeenCalledWith(tripData);
    });
  });

  describe("updateTrip", () => {
    const tripId = "trip123";
    const updateData = { capacity: 30 };

    it("should update a trip successfully", async () => {
      const updatedTrip = { _id: tripId, name: "Updated Trip", ...updateData };
      MockedTrip.findByIdAndUpdate.mockResolvedValue(updatedTrip as any);

      const result = await operatorService.updateTrip(tripId, updateData);

      expect(MockedTrip.findByIdAndUpdate).toHaveBeenCalledWith(
        tripId,
        updateData,
        { new: true }
      );
      expect(result).toEqual(updatedTrip);
    });

    it("should throw an error if trip to update is not found", async () => {
      MockedTrip.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        operatorService.updateTrip(tripId, updateData)
      ).rejects.toThrow(
        `Failed to update trip: Trip with ID ${tripId} not found`
      );
      expect(MockedTrip.findByIdAndUpdate).toHaveBeenCalledWith(
        tripId,
        updateData,
        { new: true }
      );
    });

    it("should throw an error if trip update fails", async () => {
      const error = new Error("Database update error");
      MockedTrip.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        operatorService.updateTrip(tripId, updateData)
      ).rejects.toThrow(`Failed to update trip: ${error.message}`);
      expect(MockedTrip.findByIdAndUpdate).toHaveBeenCalledWith(
        tripId,
        updateData,
        { new: true }
      );
    });

    it("should throw an error if trip update fails with non-Error", async () => {
      const error = "Database update error string";
      MockedTrip.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        operatorService.updateTrip(tripId, updateData)
      ).rejects.toThrow(`Failed to update trip: ${error}`);
      expect(MockedTrip.findByIdAndUpdate).toHaveBeenCalledWith(
        tripId,
        updateData,
        { new: true }
      );
    });
  });

  describe("cancelTrip", () => {
    const tripId = "trip123";

    it("should cancel a trip successfully", async () => {
      const deletedTrip = { _id: tripId, name: "Cancelled Trip" };
      MockedTrip.findByIdAndDelete.mockResolvedValue(deletedTrip as any);

      const result = await operatorService.cancelTrip(tripId);

      expect(MockedTrip.findByIdAndDelete).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(deletedTrip);
    });

    it("should throw an error if trip to cancel is not found", async () => {
      MockedTrip.findByIdAndDelete.mockResolvedValue(null);

      await expect(operatorService.cancelTrip(tripId)).rejects.toThrow(
        `Failed to cancel trip: Trip with ID ${tripId} not found`
      );
      expect(MockedTrip.findByIdAndDelete).toHaveBeenCalledWith(tripId);
    });

    it("should throw an error if trip cancellation fails", async () => {
      const error = new Error("Database delete error");
      MockedTrip.findByIdAndDelete.mockRejectedValue(error);

      await expect(operatorService.cancelTrip(tripId)).rejects.toThrow(
        `Failed to cancel trip: ${error.message}`
      );
      expect(MockedTrip.findByIdAndDelete).toHaveBeenCalledWith(tripId);
    });

    it("should throw an error if trip cancellation fails with non-Error", async () => {
      const error = "Database delete error string";
      MockedTrip.findByIdAndDelete.mockRejectedValue(error);

      await expect(operatorService.cancelTrip(tripId)).rejects.toThrow(
        `Failed to cancel trip: ${error}`
      );
      expect(MockedTrip.findByIdAndDelete).toHaveBeenCalledWith(tripId);
    });
  });

  describe("getOperatorBookings", () => {
    const busId = "bus456";
    const trip1 = { _id: "trip1" };
    const trip2 = { _id: "trip2" };
    const bookings = [
      { _id: "booking1", trip_id: trip1 },
      { _id: "booking2", trip_id: trip2 },
    ];

    it("should get bookings for a specific bus ID", async () => {
      MockedTrip.find.mockResolvedValue([trip1, trip2] as any);
      mockPopulate.mockResolvedValue(bookings);

      const result = await operatorService.getOperatorBookings(busId);

      expect(MockedTrip.find).toHaveBeenCalledWith({ bus_id: busId });
      expect(MockedBooking.find).toHaveBeenCalledWith({
        trip_id: { $in: [trip1._id, trip2._id] },
      });
      expect(mockPopulate).toHaveBeenCalledWith("trip_id");
      expect(result).toEqual(bookings);
    });

    it("should return an empty array if no trips found for the bus ID", async () => {
      MockedTrip.find.mockResolvedValue([]);

      const result = await operatorService.getOperatorBookings(busId);

      expect(MockedTrip.find).toHaveBeenCalledWith({ bus_id: busId });
      expect(MockedBooking.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should return an empty array if null returned for trips found for the bus ID", async () => {
      MockedTrip.find.mockResolvedValue(null);

      const result = await operatorService.getOperatorBookings(busId);

      expect(MockedTrip.find).toHaveBeenCalledWith({ bus_id: busId });
      expect(MockedBooking.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should get all bookings if no bus ID is provided", async () => {
      mockPopulate.mockResolvedValue(bookings);

      const result = await operatorService.getOperatorBookings();

      expect(MockedTrip.find).not.toHaveBeenCalled();
      expect(MockedBooking.find).toHaveBeenCalledWith();
      expect(mockPopulate).toHaveBeenCalledWith("trip_id");
      expect(result).toEqual(bookings);
    });

    it("should throw an error if fetching trips fails", async () => {
      const error = new Error("Trip find error");
      MockedTrip.find.mockRejectedValue(error);

      await expect(operatorService.getOperatorBookings(busId)).rejects.toThrow(
        `Failed to fetch operator bookings: ${error.message}`
      );
      expect(MockedTrip.find).toHaveBeenCalledWith({ bus_id: busId });
      expect(MockedBooking.find).not.toHaveBeenCalled();
    });

    it("should throw an error if fetching bookings fails (with bus ID)", async () => {
      const error = new Error("Booking find error");
      MockedTrip.find.mockResolvedValue([trip1] as any);
      mockPopulate.mockRejectedValue(error);

      await expect(operatorService.getOperatorBookings(busId)).rejects.toThrow(
        `Failed to fetch operator bookings: ${error.message}`
      );
      expect(MockedTrip.find).toHaveBeenCalledWith({ bus_id: busId });
      expect(MockedBooking.find).toHaveBeenCalledWith({
        trip_id: { $in: [trip1._id] },
      });
      expect(mockPopulate).toHaveBeenCalledWith("trip_id");
    });

    it("should throw an error if fetching bookings fails (without bus ID)", async () => {
      const error = new Error("Booking find error");
      mockPopulate.mockRejectedValue(error);

      await expect(operatorService.getOperatorBookings()).rejects.toThrow(
        `Failed to fetch operator bookings: ${error.message}`
      );
      expect(MockedTrip.find).not.toHaveBeenCalled();
      expect(MockedBooking.find).toHaveBeenCalledWith();
      expect(mockPopulate).toHaveBeenCalledWith("trip_id");
    });

    it("should throw an error if fetching fails with non-Error object", async () => {
      const error = "Database fetch error string";
      MockedTrip.find.mockRejectedValue(error);

      await expect(operatorService.getOperatorBookings(busId)).rejects.toThrow(
        `Failed to fetch operator bookings: ${error}`
      );
      expect(MockedTrip.find).toHaveBeenCalledWith({ bus_id: busId });
    });
  });
});
