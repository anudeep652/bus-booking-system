import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { TBusSearch, TBusSearchResults } from "../../types/bus";

export const busApi = createApi({
  reducerPath: "busApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBuses: builder.query<TBusSearchResults, TBusSearch>({
      query: ({
        source,
        destination,
        startDate,
        endDate,
        minPrice,
        maxPrice,
      }) => ({
        url: "/trip/search",
        params: {
          source,
          destination,
          startDate,
          endDate,
          minPrice,
          maxPrice,
        },
      }),
    }),
    getBusById: builder.query({
      query: (id) => `/buses/${id}`,
    }),
  }),
});
export const { useGetBusesQuery, useGetBusByIdQuery } = busApi;
