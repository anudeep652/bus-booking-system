import type { Request, Response } from "express";

const mockGetBookingHistory = jest.fn();
const mockCreateBooking = jest.fn();
const mockCancelBooking = jest.fn();

jest.mock("../../services/BookingService.ts", () => {
  return {
    BookingService: jest.fn().mockImplementation(() => {
      return {
        getBookingHistory: mockGetBookingHistory,
        createBooking: mockCreateBooking,
        cancelBooking: mockCancelBooking,
      };
    }),
  };
});

const mockRequest = (body = {}, params = {}, query = {}): Request => {
  return {
    body,
    params,
    query,
  } as Request;
};

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
};

import {
  getBookingHistory,
  createBooking,
  cancelBooking,
} from "../../controllers/bookingController.ts";

describe("Booking Controller", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
  });

  describe("getBookingHistory", () => {
    const userId = "user123";
    const mockBookings = [
      { id: "b1", tripId: "t1" },
      { id: "b2", tripId: "t2" },
    ];

    it("should return booking history on success", async () => {
      req = mockRequest({}, { id: userId });
      mockGetBookingHistory.mockResolvedValue(mockBookings);

      await getBookingHistory(req, res);

      expect(mockGetBookingHistory).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockBookings,
      });
    });

    it("should return 404 if service throws an Error", async () => {
      req = mockRequest({}, { id: userId });
      const error = new Error("No bookings found for user");
      mockGetBookingHistory.mockRejectedValue(error);

      await getBookingHistory(req, res);

      expect(mockGetBookingHistory).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No bookings found for user",
      });
    });

    it("should return 404 if service throws a non-Error", async () => {
      req = mockRequest({}, { id: userId });
      const error = "Database timeout";
      mockGetBookingHistory.mockRejectedValue(error);

      await getBookingHistory(req, res);

      expect(mockGetBookingHistory).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to get booking history, Unknown error occured: Database timeout",
      });
    });
  });

  describe("createBooking", () => {
    const userId = "user456";
    const tripId = "trip789";
    const seatNumbers = [5, 6];
    const bookingData = { trip_id: tripId, seat_numbers: seatNumbers };
    const mockNewBooking = { id: "bookingNew", userId, tripId, seatNumbers };

    it("should create a booking successfully", async () => {
      req = mockRequest(bookingData, { id: userId });
      mockCreateBooking.mockResolvedValue(mockNewBooking);

      await createBooking(req, res);

      expect(mockCreateBooking).toHaveBeenCalledWith(userId, bookingData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNewBooking,
      });
    });

    it("should return 400 if service throws an Error", async () => {
      req = mockRequest(bookingData, { id: userId });
      const error = new Error("Seats not available");
      mockCreateBooking.mockRejectedValue(error);

      await createBooking(req, res);

      expect(mockCreateBooking).toHaveBeenCalledWith(userId, bookingData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Seats not available",
      });
    });

    it("should return 400 if service throws a non-Error", async () => {
      req = mockRequest(bookingData, { id: userId });
      const error = { code: "INVALID_TRIP" };
      mockCreateBooking.mockRejectedValue(error);

      await createBooking(req, res);

      expect(mockCreateBooking).toHaveBeenCalledWith(userId, bookingData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to create booking,Unknown error occured: [object Object]",
      });
    });
  });

  describe("cancelBooking", () => {
    const userId = "user789";
    const bookingId = "bookingToCancel";
    const mockCancelledBooking = { id: bookingId, status: "cancelled" };

    it("should cancel a booking successfully", async () => {
      req = mockRequest({}, { id: userId, bookingId: bookingId });
      mockCancelBooking.mockResolvedValue(mockCancelledBooking);

      await cancelBooking(req, res);

      expect(mockCancelBooking).toHaveBeenCalledWith(bookingId, userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCancelledBooking,
      });
    });

    it("should return 400 if service throws an Error", async () => {
      req = mockRequest({}, { id: userId, bookingId: bookingId });
      const error = new Error("Booking already cancelled or does not exist");
      mockCancelBooking.mockRejectedValue(error);

      await cancelBooking(req, res);

      expect(mockCancelBooking).toHaveBeenCalledWith(bookingId, userId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Booking already cancelled or does not exist",
      });
    });

    it("should return 400 if service throws a non-Error", async () => {
      req = mockRequest({}, { id: userId, bookingId: bookingId });
      const error = "Cancellation period expired";
      mockCancelBooking.mockRejectedValue(error);

      await cancelBooking(req, res);

      expect(mockCancelBooking).toHaveBeenCalledWith(bookingId, userId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Failed to cancel booking, Unknown error occured: Cancellation period expired",
      });
    });
  });
});
