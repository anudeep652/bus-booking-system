export interface IAuthResult {
  success: boolean;
  message: string;
  token?: string;
  statusCode: number;
}

export interface IAuthData {
  email: string;
  password: string;
  [key: string]: any;
}

export interface IAuthService {
  register(data: IAuthData): Promise<IAuthResult>;
  login(email: string, password: string): Promise<IAuthResult>;
}
