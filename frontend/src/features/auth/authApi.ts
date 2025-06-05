import { createApi } from "@reduxjs/toolkit/query/react";
import { TAuthResponse, TLoginRequest, TRegisterRequest } from "../../types";
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
      transformErrorResponse: (response: { status: number; data: {} }) => {
        if (response.status === 401) {
          return {
            status: response.status,
            data: { message: "Invalid credentials" },
          };
        }
        return {
          status: response.status,
          data: response.data || { message: "An error occurred during login" },
        };
      },
    }),

    register: builder.mutation<TAuthResponse, TRegisterRequest>({
      query: (userData) => ({
        url: `/${userData.role}/register`,
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
