import { TUserRole } from ".";

export type TLoginRequest = {
  password: string;
  role: TUserRole;
  email?: string;
  phone?: string;
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
  role: TUserRole;
};

export type TUserData = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role?: TUserRole;
};

export type TAuthState = {
  user: TUserData | null;
  token: string | null;
  isAuthenticated: boolean;
};

export type TLoginSuccessPayload = {
  user: TUserData;
  token: string;
  role: TUserRole;
};

export type TLoginError = Partial<TLoginRequest>;

export type TRegisterError = TLoginError & {
  name?: string;
  confirmPassword?: string;
  companyName?: string;
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
  submitAttempted: boolean;
};

export type TRegisterAction =
  | { type: "SET_FIELD"; field: keyof TRegisterState; value: string }
  | { type: "SET_ROLE"; value: TUserRole }
  | { type: "VALIDATE" }
  | { type: "SET_VALIDATION_RESULT"; isValid: boolean }
  | { type: "SET_SUBMIT_ATTEMPTED"; value: boolean };

export type TLoginState = {
  email: string;
  password: string;
  role: TUserRole;
  phone: string;
  errors: TLoginError;
  isValid: boolean;
  submitAttempted: boolean;
};

export type TLoginAction =
  | { type: "SET_FIELD"; field: keyof TLoginState; value: string }
  | { type: "SET_ROLE"; value: TUserRole }
  | { type: "VALIDATE" }
  | { type: "RESET" }
  | {
      type: "SET_SUBMIT_ATTEMPTED";
      value: boolean;
    };
