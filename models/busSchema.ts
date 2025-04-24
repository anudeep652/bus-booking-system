import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  operator_id: { type: mongoose.Schema.Types.ObjectId, ref: "Operator" },
  bus_number: {
    type: String,
    required: true,
    unique: true,
  },
  bus_type: {
    type: String,
    enum: ["sleeper", "semi-sleeper", "seater"],
    required: true,
  },
  total_seats: {
    type: Number,
    required: true,
  },
  amenities: [String],
});

export const Bus = mongoose.model("Bus", BusSchema);
