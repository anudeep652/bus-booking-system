import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { RootState } from "../app/store";

export const createBaseQuery = () =>
  fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });
