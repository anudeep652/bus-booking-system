import { createApi } from "@reduxjs/toolkit/query/react";
import {
  TAuthResponse,
  TLoginRequest,
  TRegisterRequest,
  TUserData,
} from "../../types";
import { createBaseQuery } from "../baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: createBaseQuery(),
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
