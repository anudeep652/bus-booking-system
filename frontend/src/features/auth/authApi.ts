import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserData } from "./authSlice";
import { TUserRole } from "../../types";

export interface LoginRequest {
  email: string;
  password: string;
  role: TUserRole;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: TUserRole;
  adminCode?: string;
  employeeId?: string;
}

export interface AuthResponse {
  user: UserData;
  token: string;
  message?: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.REACT_APP_API_URL || "http://localhost:8000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: `/${credentials.role}/login`,
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: `/${userData.role}/register`,
        method: "POST",
        body: userData,
      }),
    }),

    getCurrentUser: builder.query<UserData, void>({
      query: () => "/auth/me",
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;
