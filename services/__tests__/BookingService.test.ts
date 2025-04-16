// @ts-nocheck
import { BookingService } from "../BookingService";
import { User, Trip, Booking } from "../../models/index";

jest.mock("../../models/bookingSchema");
jest.mock("../../models/index");

describe("BookingService", () => {
  let bookingService: BookingService;
  const mockUserId = "user123";
  const mockTripId = "trip456";
  const mockBookingId = "booking789";

  beforeEach(() => {
    bookingService = new BookingService();
    jest.clearAllMocks();
  });

  describe("getBookingHistory", () => {
    test("should return bookings when user exists", async () => {
      const mockUser = { _id: mockUserId, name: "John Doe" };
      const mockBookings = [
        { _id: "booking1", trip_id: mockTripId, user_id: mockUserId },
      ];

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Booking.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBookings),
        }),
      });

      const result = await bookingService.getBookingHistory(mockUserId);

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Booking.find).toHaveBeenCalledWith({ user_id: mockUserId });
      expect(result).toEqual(mockBookings);
    });

    test("should throw error when user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingService.getBookingHistory(mockUserId)
      ).rejects.toThrow("Failed to fetch booking history: User not found");

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Booking.find).not.toHaveBeenCalled();
    });

    test("should handle database errors properly", async () => {
      const dbError = new Error("Database connection error");
      (User.findById as jest.Mock).mockRejectedValue(dbError);

      await expect(
        bookingService.getBookingHistory(mockUserId)
      ).rejects.toThrow(
        "Failed to fetch booking history: Database connection error"
      );
    });
    test("should handle generic errors properly", async () => {
      (User.findById as jest.Mock).mockImplementationOnce(() => {
        throw "Network failure";
      });

      await expect(
        bookingService.getBookingHistory(mockUserId)
      ).rejects.toThrow("Failed to fetch booking history: Network failure");
    });
  });

  describe("createBooking", () => {
    const bookingData = {
      trip_id: mockTripId,
      seat_numbers: [1, 2, 3],
    };

    const mockUser = { _id: mockUserId, name: "user" };
    const mockTrip = { _id: mockTripId, name: "trip 2" };
    const mockNewBooking = {
      _id: mockBookingId,
      user_id: mockUserId,
      trip_id: mockTripId,
      seat_numbers: [1, 2, 3],
      payment_status: "pending",
      booking_status: "confirmed",
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockReturnThis(),
    };

    test("should create a booking successfully", async () => {
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);
      (Booking as jest.Mock).mockImplementation(() => mockNewBooking);

      const result = await bookingService.createBooking(
        mockUserId,
        bookingData
      );

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Trip.findById).toHaveBeenCalledWith(mockTripId);
      expect(mockNewBooking.save).toHaveBeenCalled();
      expect(mockNewBooking.populate).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockNewBooking);
    });

    test("should throw error when user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingService.createBooking(mockUserId, bookingData)
      ).rejects.toThrow("Failed to create booking: User not found");

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
    });

    test("should throw error when trip not found", async () => {
      jest.clearAllMocks();

      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      (Trip.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        bookingService.createBooking(mockUserId, bookingData)
      ).rejects.toThrow("Failed to create booking: Trip not found");

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Trip.findById).toHaveBeenCalledWith(mockTripId);
    });

    test("should handle save errors properly", async () => {
      const saveError = new Error("Save failed");
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Trip.findById as jest.Mock).mockResolvedValue(mockTrip);
      (Booking as jest.Mock).mockImplementation(() => ({
        ...mockNewBooking,
        save: jest.fn().mockRejectedValue(saveError),
      }));

      await expect(
        bookingService.createBooking(mockUserId, bookingData)
      ).rejects.toThrow("Failed to create booking: Save failed");
    });
    test("should handle generic errors properly", async () => {
      (User.findById as jest.Mock).mockImplementationOnce(() => {
        throw "Network failure";
      });

      await expect(
        bookingService.createBooking(mockUserId, bookingData)
      ).rejects.toThrow("Failed to create booking: Network failure");
    });
  });

  describe("cancelBooking", () => {
    const mockUpdatedBooking = {
      _id: mockBookingId,
      user_id: mockUserId,
      booking_status: "cancelled",
      payment_status: "failed",
    };

    test("should cancel booking successfully", async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: mockUserId });
      (Booking.findOneAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedBooking
      );

      const result = await bookingService.cancelBooking(
        mockBookingId,
        mockUserId
      );

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Booking.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: mockBookingId,
          user_id: mockUserId,
        },
        {
          booking_status: "cancelled",
          payment_status: "failed",
        },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedBooking);
    });

    test("should throw error when user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingService.cancelBooking(mockBookingId, mockUserId)
      ).rejects.toThrow("Failed to cancel booking: User not found");

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Booking.findOneAndUpdate).not.toHaveBeenCalled();
    });

    test("should throw error when booking not found or unauthorized", async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: mockUserId });
      (Booking.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingService.cancelBooking(mockBookingId, mockUserId)
      ).rejects.toThrow(
        "Failed to cancel booking: Booking not found or unauthorized"
      );

      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Booking.findOneAndUpdate).toHaveBeenCalled();
    });

    test("should handle database errors properly", async () => {
      const dbError = new Error("Database error");
      (User.findById as jest.Mock).mockResolvedValue({ _id: mockUserId });
      (Booking.findOneAndUpdate as jest.Mock).mockRejectedValue(dbError);

      await expect(
        bookingService.cancelBooking(mockBookingId, mockUserId)
      ).rejects.toThrow("Failed to cancel booking: Database error");
    });
    test("should handle generic errors properly", async () => {
      (User.findById as jest.Mock).mockImplementationOnce(() => {
        throw "Network failure";
      });

      await expect(
        bookingService.cancelBooking(mockBookingId, mockUserId)
      ).rejects.toThrow("Failed to cancel booking: Network failure");
    });
  });
});
