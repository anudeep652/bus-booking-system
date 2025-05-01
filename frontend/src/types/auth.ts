import { TUserRole } from ".";

export type TLoginRequest = {
  email: string;
  password: string;
  role: TUserRole;
};

export type TRegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: TUserRole;
  adminCode?: string;
  employeeId?: string;
};

export type TAuthResponse = {
  user: TUserData;
  token: string;
  message?: string;
};

export type TUserData = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
};

export type TAuthState = {
  user: TUserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: TUserRole | null;
};

export type TLoginSuccessPayload = {
  user: TUserData;
  token: string;
  role: TUserRole;
};

export type TLoginError = {
  name?: string;
  email?: string;
  password?: string;
};

export type TRegisterError = TLoginError & {
  phone?: string;
  confirmPassword?: string;
  adminCode?: string;
  employeeId?: string;
};
