import type { Request, Response } from "express";

import { AuthServiceFactory } from "../services/auth/AuthServiceFactory.ts";

export const registerOperator = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("operator");
  const result = await authService.register(req.body);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token
  });
};

export const loginOperator = async (req: Request, res: Response) => {
  const authService = AuthServiceFactory.createAuthService("operator");
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return res.status(result.statusCode).json({
    message: result.message,
    token: result.token
  });
};