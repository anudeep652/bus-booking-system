import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Trip"],
  endpoints: (builder) => ({
    bookBus: builder.mutation<
      any,
      { trip_id: string; seat_numbers: number[]; timestamp: string }
    >({
      query: (data) => ({
        url: "/booking/book",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Trip"],
    }),

    getTripDetailById: builder.query({
      query: (id) => `/trip/${id}`,
      providesTags: ["Trip"],
    }),

    getUserTripHistory: builder.query<any, any>({
      query: () => "/booking/history",
      providesTags: ["Trip"],
    }),
  }),
});

export const {
  useBookBusMutation,
  useGetTripDetailByIdQuery,
  useGetUserTripHistoryQuery,
} = bookingApi;
