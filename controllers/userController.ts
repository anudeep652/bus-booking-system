import type { Request, Response } from "express";
import { AuthServiceFactory } from "../services/auth/AuthServiceFactory.ts";
import { UserService } from "../services/UserService.ts";

export const registerUser = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("user");
  const result = await authService.register(req.body);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("user");
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
  });
};

const userService = new UserService();

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userProfile = await userService.getProfile(id);

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Failed to retrieve user profile",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    const updatedUser = await userService.updateProfile(id, updateData);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update user profile",
    });
  }
};
