import { createTrip, updateTrip, cancelTrip, getOperatorBookings } from "../OperatorService.ts";
import { Trip } from "../../models/tripSchema.ts";
import { Booking } from "../../models/bookingSchema.ts";
import { viewOperatorBookings } from "../../controllers/operatorController.ts";

// Mock the Mongoose model methods.
jest.mock("../../models/tripSchema.ts", () => ({
  Trip: {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
  },
}));

const createMockReq = (data:any) => ({ ...data });
const createMockRes = () => {
  const res:any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


jest.mock("../../models/bookingSchema.ts", () => ({
  Booking: {
    find: jest.fn(),
  },
}));

describe("operatorService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTrip", () => {
    it("should create a trip and return it", async () => {
      const tripData = { source: "City A", destination: "City B", price: 50 };
      const createdTrip = { _id: "trip123", ...tripData };

      (Trip.create as jest.Mock).mockResolvedValue(createdTrip);
      
      const result = await createTrip(tripData);
      
      expect(Trip.create).toHaveBeenCalledWith(tripData);
      expect(result).toEqual(createdTrip);
    });
  });

  describe("updateTrip", () => {
    it("should update and return the trip", async () => {
      const tripId = "trip123";
      const updateData = { price: 60 };
      const updatedTrip = { _id: tripId, source: "City A", destination: "City B", price: 60 };

      (Trip.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedTrip);
      
      const result = await updateTrip(tripId, updateData);
      
      expect(Trip.findByIdAndUpdate).toHaveBeenCalledWith(tripId, updateData, { new: true });
      expect(result).toEqual(updatedTrip);
    });
  });

  describe("cancelTrip", () => {
    it("should delete the trip and return the deleted document", async () => {
      const tripId = "trip123";
      const deletedTrip = { _id: tripId };

      (Trip.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedTrip);
      
      const result = await cancelTrip(tripId);
      
      expect(Trip.findByIdAndDelete).toHaveBeenCalledWith(tripId);
      expect(result).toEqual(deletedTrip);
    });
  });

  describe("getOperatorBookings", () => {
    it("should return filtered bookings for a given bus_id", async () => {
      const bus_id = "bus123";
      const trips = [{ _id: "trip1" }, { _id: "trip2" }];
      const bookings = [{ _id: "booking1", trip_id: "trip1" }];

      (Trip.find as jest.Mock).mockResolvedValue(trips);
      // Simulate Booking.find returning a query that supports .populate()
      const populateMock = jest.fn().mockResolvedValue(bookings);
      (Booking.find as jest.Mock).mockReturnValue({ populate: populateMock });
      
      const result = await getOperatorBookings(bus_id);
      
      expect(Trip.find).toHaveBeenCalledWith({ bus_id });
      expect(Booking.find).toHaveBeenCalledWith({ trip_id: { $in: trips.map((t) => t._id) } });
      expect(populateMock).toHaveBeenCalledWith("trip_id");
      expect(result).toEqual(bookings);
    });

    it("should return all bookings if no bus_id is provided", async () => {
      const bookings = [{ _id: "booking1", trip_id: "trip1" }];

      const populateMock = jest.fn().mockResolvedValue(bookings);
      (Booking.find as jest.Mock).mockReturnValue({ populate: populateMock });
      
      const result = await viewOperatorBookings(createMockReq({}), createMockRes());
      
      expect(Booking.find).toHaveBeenCalledWith();
      expect(populateMock).toHaveBeenCalledWith("trip_id");
      expect(result).toEqual(bookings);
    });
  });
});
