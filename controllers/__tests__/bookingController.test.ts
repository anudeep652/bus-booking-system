import { Request, Response } from 'express';
import { 
  getBookingHistory, 
  createBooking, 
  cancelBooking 
} from '../../controllers/bookingController.ts';
import { BookingService } from '../../services/BookingService.ts';

describe('BookingController', () => {
  let mockBookingService: jest.Mocked<BookingService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Mock BookingService
    mockBookingService = {
      getBookingHistory: jest.fn(),
      createBooking: jest.fn(),
      cancelBooking: jest.fn()
    } as any;

    // Replace the instantiated service with mock
    jest.spyOn(BookingService.prototype, 'constructor').mockImplementation(() => {
      return mockBookingService;
    });

    // Setup mock request and response
    mockReq = {
      params: {},
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookingHistory', () => {
    it('should retrieve booking history successfully', async () => {
      const mockBookings = [{ id: '1' }, { id: '2' }];
      mockReq.params = { id: 'user123' };
      mockBookingService.getBookingHistory.mockResolvedValue(mockBookings);

      await getBookingHistory(mockReq as Request, mockRes as Response);

      expect(mockBookingService.getBookingHistory).toHaveBeenCalledWith('user123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockBookings
      });
    });

    it('should handle error when retrieving booking history', async () => {
      mockReq.params = { id: 'user123' };
      const mockError = new Error('Retrieval failed');
      mockBookingService.getBookingHistory.mockRejectedValue(mockError);

      console.error = jest.fn(); 

      await getBookingHistory(mockReq as Request, mockRes as Response);

      expect(console.error).toHaveBeenCalledWith(
        "Booking history retrieval error:", 
        mockError
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Retrieval failed'
      });
    });
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const mockBooking = { id: 'booking123' };
      mockReq.params = { id: 'user123' };
      mockReq.body = { 
        trip_id: 'trip123', 
        seat_numbers: [1, 2] 
      };
      mockBookingService.createBooking.mockResolvedValue(mockBooking);

      await createBooking(mockReq as Request, mockRes as Response);

      expect(mockBookingService.createBooking).toHaveBeenCalledWith('user123', {
        trip_id: 'trip123',
        seat_numbers: [1, 2]
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockBooking
      });
    });

    it('should handle error when creating booking', async () => {
      mockReq.params = { id: 'user123' };
      mockReq.body = { 
        trip_id: 'trip123', 
        seat_numbers: [1, 2] 
      };
      const mockError = new Error('Booking creation failed');
      mockBookingService.createBooking.mockRejectedValue(mockError);

      console.error = jest.fn(); 

      await createBooking(mockReq as Request, mockRes as Response);

      expect(console.error).toHaveBeenCalledWith(
        "Booking creation error:", 
        mockError
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Booking creation failed'
      });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      const mockCancelledBooking = { id: 'booking123' };
      mockReq.params = { 
        id: 'user123', 
        bookingId: 'booking123' 
      };
      mockBookingService.cancelBooking.mockResolvedValue(mockCancelledBooking);

      await cancelBooking(mockReq as Request, mockRes as Response);

      expect(mockBookingService.cancelBooking).toHaveBeenCalledWith(
        'booking123', 
        'user123'
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCancelledBooking,
        message: "Booking successfully cancelled"
      });
    });

    it('should handle error when cancelling booking', async () => {
      mockReq.params = { 
        id: 'user123', 
        bookingId: 'booking123' 
      };
      const mockError = new Error('Booking cancellation failed');
      mockBookingService.cancelBooking.mockRejectedValue(mockError);

      console.error = jest.fn(); // Mock console.error

      await cancelBooking(mockReq as Request, mockRes as Response);

      expect(console.error).toHaveBeenCalledWith(
        "Booking cancellation error:", 
        mockError
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Booking cancellation failed'
      });
    });
  });
});