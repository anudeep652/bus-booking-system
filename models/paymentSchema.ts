import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  payment_method: String,
  payment_status: {
    type: String,
    enum: ["pending", "successful", "failed"],
    default: "pending",
  },
});

export const Payment = mongoose.model("Payment", PaymentSchema);
