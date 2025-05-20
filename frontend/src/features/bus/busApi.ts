import { createApi } from "@reduxjs/toolkit/query/react";
import { TBusSearchParams, TBusSearchResults } from "../../types/bus";
import { createBaseQuery } from "../baseQuery";

export const busApi = createApi({
  reducerPath: "busApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Bus"],
  endpoints: (builder) => ({
    getBuses: builder.query<TBusSearchResults, TBusSearchParams>({
      providesTags: ["Bus"],
      query: ({
        source,
        destination,
        startDate,
        endDate,
        minPrice,
        maxPrice,
        busType,
      }) => ({
        url: "/trip/search",
        params: {
          source,
          destination,
          startDate,
          endDate,
          minPrice,
          maxPrice,
          busType,
        },
      }),
    }),
    getBusById: builder.query({
      query: (id: string) => `/buses/${id}`,
    }),
  }),
});
export const { useGetBusesQuery, useGetBusByIdQuery } = busApi;
