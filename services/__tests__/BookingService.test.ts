import { BookingService } from '../../services/BookingService.ts';
import { User } from '../../models/userSchema.ts';
import { Trip } from '../../models/tripSchema.ts';
import { Booking } from '../../models/bookingSchema.ts';
import mongoose from 'mongoose';

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockUser: any;
  let mockTrip: any;
  let mockBooking: any;

  beforeEach(() => {
    bookingService = new BookingService();
    
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com'
    };

    mockTrip = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Trip',
      destination: 'Test Destination',
      date: new Date(),
      price: 100
    };

    mockBooking = {
      _id: new mongoose.Types.ObjectId(),
      user_id: mockUser._id,
      trip_id: mockTrip._id,
      seat_numbers: [1, 2],
      payment_status: 'pending',
      booking_status: 'confirmed'
    };

    jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(Trip, 'findById').mockResolvedValue(mockTrip);
    jest.spyOn(Booking, 'find').mockResolvedValue([mockBooking]);
    jest.spyOn(Booking.prototype, 'save').mockResolvedValue(mockBooking);
    jest.spyOn(Booking, 'findOneAndUpdate').mockResolvedValue(mockBooking);
    
    jest.spyOn(Booking.prototype, 'populate').mockResolvedValue({
      ...mockBooking,
      trip_id: mockTrip,
      user_id: mockUser
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookingHistory', () => {
    it('should retrieve booking history for a valid user', async () => {
      const bookings = await bookingService.getBookingHistory(mockUser._id.toString());
      
      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(Booking.find).toHaveBeenCalledWith({ user_id: mockUser._id.toString() });
      expect(bookings).toHaveLength(1);
      expect(bookings[0].user_id).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await expect(bookingService.getBookingHistory(mockUser._id.toString()))
        .rejects.toThrow('User not found');
    });
  });

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        trip_id: mockTrip._id.toString(),
        seat_numbers: [1, 2]
      };

      const newBooking = await bookingService.createBooking(mockUser._id.toString(), bookingData);
      
      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(Trip.findById).toHaveBeenCalledWith(mockTrip._id.toString());
      expect(newBooking.user_id).toEqual(mockUser);
      expect(newBooking.trip_id).toEqual(mockTrip);
      expect(newBooking.seat_numbers).toEqual([1, 2]);
      expect(newBooking.payment_status).toBe('pending');
      expect(newBooking.booking_status).toBe('confirmed');
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await expect(bookingService.createBooking(mockUser._id.toString(), {
        trip_id: mockTrip._id.toString(),
        seat_numbers: [1, 2]
      })).rejects.toThrow('User not found');
    });

    it('should throw an error if trip is not found', async () => {
      jest.spyOn(Trip, 'findById').mockResolvedValue(null);

      await expect(bookingService.createBooking(mockUser._id.toString(), {
        trip_id: mockTrip._id.toString(),
        seat_numbers: [1, 2]
      })).rejects.toThrow('Trip not found');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      const cancelledBooking = await bookingService.cancelBooking(
        mockBooking._id.toString(), 
        mockUser._id.toString()
      );
      
      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(Booking.findOneAndUpdate).toHaveBeenCalledWith(
        { 
          _id: mockBooking._id.toString(), 
          user_id: mockUser._id.toString() 
        },
        { 
          booking_status: 'cancelled',
          payment_status: 'failed'
        },
        { new: true }
      );
      expect(cancelledBooking.booking_status).toBe('confirmed'); // From mock
      expect(cancelledBooking.payment_status).toBe('pending'); // From mock
    });

    it('should throw an error if user is not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await expect(bookingService.cancelBooking(
        mockBooking._id.toString(), 
        mockUser._id.toString()
      )).rejects.toThrow('User not found');
    });

    it('should throw an error if booking is not found or unauthorized', async () => {
      jest.spyOn(Booking, 'findOneAndUpdate').mockResolvedValue(null);

      await expect(bookingService.cancelBooking(
        mockBooking._id.toString(), 
        mockUser._id.toString()
      )).rejects.toThrow('Booking not found or unauthorized');
    });
  });
});