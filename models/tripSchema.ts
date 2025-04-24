import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
  bus_id: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
  source: String,
  destination: String,
  departure_time: Date,
  arrival_time: Date,
  price: Number,
  available_seats: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "cancelled", "completed"],
    default: "scheduled",
  },
});

export const Trip = mongoose.model("Trip", TripSchema);
