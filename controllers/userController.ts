import { comparePassword, hashPassword, signJwt } from "../utils/authUtils.ts";
import { User } from "../models/userSchema.ts";
import type { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      status: "active",
    });

    await newUser.save();
    const token = signJwt(newUser._id, newUser.role ?? "");

    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {
    return res.status(500).json({ message: (error as any).message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await comparePassword(password, user.password ?? "");
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = signJwt(user._id, user.role ?? "");

    return res.json({ message: "User login successful", token });
  } catch (error) {
    return res.status(500).json({ message: (error as any).message });
  }
};
