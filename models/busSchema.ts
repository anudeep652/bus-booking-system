import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  operator_id: { type: mongoose.Schema.Types.ObjectId, ref: "Operator" },
  bus_number: String,
  bus_type: String,
  total_seats: Number,
  amenities: [String],
});

export const Bus = mongoose.model("Bus", BusSchema);
