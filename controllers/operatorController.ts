import { comparePassword, hashPassword, signJwt } from "../utils/authUtils.ts";
import { Operator } from "../models/operatorSchema.ts";
import type { Request, Response } from "express";

export const registerOperator = async (req: Request, res: Response) => {
  try {
    const { company_name, email, phone, password } = req.body;

    if (!company_name || !email || !phone || !password)
      return res.status(400).json({ message: "All fields are required" });

    const hashedPassword = await hashPassword(password);
    const newOperator = new Operator({
      company_name,
      email,
      phone,
      password: hashedPassword,
      verification_status: "pending",
    });

    await newOperator.save();
    const token = signJwt(newOperator._id, "operator");

    res
      .status(201)
      .json({ message: "Operator registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
};

export const loginOperator = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await Operator.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await comparePassword(password, user.password ?? "");
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = signJwt(user._id, "operator");

    return res.json({ message: "User login successful", token });
  } catch (error) {
    return res.status(500).json({ message: (error as any).message });
  }
};
