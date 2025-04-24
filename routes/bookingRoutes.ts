// @ts-nocheck
import express from "express";
import * as bookingController from "../controllers/bookingController";
import { isAuthenticated } from "../middleware/authMiddleware";

const bookingRouter = express.Router();

bookingRouter.use(isAuthenticated);

bookingRouter.get("/:id/history", bookingController.getBookingHistory);

bookingRouter.post("/book", bookingController.createBooking);

bookingRouter.delete(
  "/:id/bookings/:bookingId",
  bookingController.cancelBooking
);

bookingRouter.put("/cancel-seats", bookingController.cancelSeats);

export default bookingRouter;
