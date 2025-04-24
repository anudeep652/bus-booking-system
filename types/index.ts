import type { Request } from "express";
import { UserRole } from "./user";

export * from "./user";
export * from "./operator";
export * from "./auth";
export * from "./bus";
export * from "./trip";

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

export interface IRequestWithMiddlewareUser extends Request {
  user: {
    userId: string;
    role: UserRole | "operator";
  };
}
