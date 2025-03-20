import mongoose from "mongoose";

const CancellationSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  refund_status: {
    type: String,
    enum: ["pending", "processed", "failed"],
    default: "pending",
  },
  cancellation_reason: String,
});

export const Cancellation = mongoose.model("Cancellation", CancellationSchema);
