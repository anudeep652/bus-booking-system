export type TAuthResult = {
  success: boolean;
  message: string;
  token?: string;
  statusCode: number;
  name?: string;
  id?: string;
};

export type TAuthData = {
  email: string;
  password: string;
  [key: string]: any;
};

export interface IAuthService {
  register(data: TAuthData): Promise<TAuthResult>;
  login(password: string, email?: string, phone?: string): Promise<TAuthResult>;
}
