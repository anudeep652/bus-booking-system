export const userStatus = {
  active: "active",
  inactive: "inactive",
} as const;
export type UserStatus = keyof typeof userStatus;

export const userRole = {
  user: "user",
  admin: "admin",
} as const;

export type UserRole = keyof typeof userRole;

export type User = {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};
