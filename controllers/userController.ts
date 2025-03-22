import type { Request, Response } from "express";
import { AuthServiceFactory } from "../services/auth/AuthServiceFactory.ts";

export const registerUser = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("user");
  const result = await authService.register(req.body);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("user");
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token
  });
};