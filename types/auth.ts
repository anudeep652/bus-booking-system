export type TAuthResult = {
  success: boolean;
  message: string;
  token?: string;
  statusCode: number;
};

export type TAuthData = {
  email: string;
  password: string;
  [key: string]: any;
};

export interface IAuthService {
  register(data: TAuthData): Promise<TAuthResult>;
  login(email: string, password: string): Promise<TAuthResult>;
}
