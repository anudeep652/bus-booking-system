import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Booking", "Trip"],
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

      invalidatesTags: ["Booking"],
    }),

    getTripDetailById: builder.query({
      query: (id) => `/trip/${id}`,
    }),

    getUserTripHistory: builder.query<any, any>({
      query: () => "/booking/history",
    }),

    getUserCurrentBookings: builder.query({
      query: () => "/booking/bookings",
      providesTags: ["Booking"],
    }),

    cancelBooking: builder.mutation({
      query: (data) => ({ url: "/booking/cancel", body: data, method: "PUT" }),
      invalidatesTags: ["Booking"],
    }),

    cancelSeats: builder.mutation({
      query: (data) => ({
        url: "/booking/cancel-seats",
        body: data,
        method: "PUT",
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useBookBusMutation,
  useGetTripDetailByIdQuery,
  useGetUserTripHistoryQuery,
  useGetUserCurrentBookingsQuery,
  useCancelBookingMutation,
  useCancelSeatsMutation,
} = bookingApi;
