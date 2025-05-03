import { createApi } from "@reduxjs/toolkit/query/react";
import { TBusSearch, TBusSearchResults } from "../../types/bus";
import { createBaseQuery } from "../baseQuery";

export const busApi = createApi({
  reducerPath: "busApi",
  baseQuery: createBaseQuery(),
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
