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
  hasAC: {
    type: Boolean,
    required: true,
  },
  total_seats: {
    type: Number,
    required: true,
  },
  ratings: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5],
    default: 0,
  },
  amenities: [String],
});

export const Bus = mongoose.model("Bus", BusSchema);
