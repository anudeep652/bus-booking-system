import express from "express";
import * as bookingController from "../controllers/bookingController";
import { isAuthenticated } from "../middleware/authMiddleware";

const bookingRouter = express.Router();

bookingRouter.use(isAuthenticated);

bookingRouter.get("/:id/history", bookingController.getBookingHistory);

bookingRouter.post("/:id/book", bookingController.createBooking);

bookingRouter.delete(
  "/:id/bookings/:bookingId",
  bookingController.cancelBooking
);

export default bookingRouter;
