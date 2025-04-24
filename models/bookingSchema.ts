import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  trip_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  seats: {
    type: [
      {
        seat_number: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["booked", "cancelled"],
          default: "booked",
        },
      },
    ],
    required: true,
  },
  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
    default: "pending",
  },
  booking_status: {
    type: String,
    enum: ["confirmed", "cancelled", "partially_cancelled"],
    default: "confirmed",
  },
});

export const Booking = mongoose.model("Booking", BookingSchema);
