import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const signJwt = (id: Types.ObjectId, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET??"secret", { expiresIn: "1d" });
};
