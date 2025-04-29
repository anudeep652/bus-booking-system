export type TUserRole = "user" | "admin" | "operator";

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
