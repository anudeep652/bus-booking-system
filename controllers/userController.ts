import type { Request, Response, RequestParamHandler } from "express";
import { AuthServiceFactory } from "../services/auth/AuthServiceFactory";
import { UserService } from "../services/UserService";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  const authService = AuthServiceFactory.createAuthService("user");
  const result = await authService.register(req.body);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
    user: {
      name: result.name,
      id: result.id,
      email: req.body.email,
      role: "user",
    },
  });
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  const authService = AuthServiceFactory.createAuthService("user");
  const { email, password, phone } = req.body;
  const result = await authService.login(email, phone, password);
  return res.status(result.statusCode).json({
    user: {
      name: result.name,
      id: result.id,
      email: email,
      role: "user",
    },
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
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve user profile: " + error,
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
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update user profile: " + error,
    });
  }
};
