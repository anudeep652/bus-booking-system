import mongoose from "mongoose";

const OperatorSchema = new mongoose.Schema({
  company_name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  verification_status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
});

export const Operator = mongoose.model("Operator", OperatorSchema);
