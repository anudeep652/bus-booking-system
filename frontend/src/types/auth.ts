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
};

export type TRegisterState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: TUserRole;
  errors: TRegisterError;
  isValid: boolean;
  companyName: string;
};

export type TRegisterAction =
  | { type: "SET_FIELD"; field: keyof TRegisterState; value: string }
  | { type: "SET_ROLE"; value: TUserRole }
  | { type: "VALIDATE" }
  | { type: "SET_VALIDATION_RESULT"; isValid: boolean };

export type TLoginState = {
  email: string;
  password: string;
  role: TUserRole;
  errors: TLoginError;
  isValid: boolean;
};

export type TLoginAction =
  | { type: "SET_FIELD"; field: keyof TLoginState; value: string }
  | { type: "SET_ROLE"; value: TUserRole }
  | { type: "VALIDATE" };
