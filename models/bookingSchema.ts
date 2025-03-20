import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  trip_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  seat_numbers: [Number],
  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  booking_status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
});

export const Booking = mongoose.model("Booking", BookingSchema);
