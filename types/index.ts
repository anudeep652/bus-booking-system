export * from "./user.ts";
export * from "./operator.ts";
export * from "./auth.ts";
export * from "./bus.ts";
export * from "./trip.ts";

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];
