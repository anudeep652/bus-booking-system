import express from 'express';
import { 
  getBookingHistory, 
  createBooking, 
  cancelBooking 
} from '../controllers/bookingController.ts';

const bookingRouter = express.Router();

bookingRouter.get('/:id/history',  getBookingHistory);

bookingRouter.post('/:id/book',  createBooking);

bookingRouter.delete('/:id/bookings/:bookingId',  cancelBooking);

export default bookingRouter;