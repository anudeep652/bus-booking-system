// @ts-nocheck
import express from "express";
import * as bookingController from "../controllers/bookingController";
import { isAuthenticated } from "../middleware/authMiddleware";

const bookingRouter = express.Router();

bookingRouter.use(isAuthenticated);

bookingRouter.get("/history", (req, res) =>
  bookingController.getBookingHistory(req, res, "history")
);
bookingRouter.get("/bookings", (req, res) =>
  bookingController.getBookingHistory(req, res, "current")
);

bookingRouter.post("/book", bookingController.createBooking);

bookingRouter.put("/cancel", bookingController.cancelBooking);

bookingRouter.put("/cancel-seats", bookingController.cancelSeats);

export default bookingRouter;
