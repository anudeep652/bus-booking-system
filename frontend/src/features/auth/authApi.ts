import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  TAuthResponse,
  TLoginRequest,
  TRegisterRequest,
  TUserData,
} from "../../types";

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
    login: builder.mutation<TAuthResponse, TLoginRequest>({
      query: (credentials) => ({
        url: `/${credentials.role}/login`,
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation<TAuthResponse, TRegisterRequest>({
      query: (userData) => ({
        url: `/${userData.role}/register`,
        method: "POST",
        body: userData,
      }),
    }),

    getCurrentUser: builder.query<TUserData, void>({
      query: () => "/me",
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/logout",
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
