import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";
import {
  TBooking,
  TBookingResponse,
  TCancelBookingResponse,
  TCancelSeatsdata,
  TTripByIdResponse,
} from "../../types";

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: createBaseQuery(),
  tagTypes: ["Booking", "Trip"],
  endpoints: (builder) => ({
    bookBus: builder.mutation<
      TBookingResponse,
      { trip_id: string; seat_numbers: number[]; timestamp: string }
    >({
      query: (data) => ({
        url: "/booking/book",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Booking"],
    }),

    getTripDetailById: builder.query<TTripByIdResponse, string>({
      query: (id: string) => `/trip/${id}`,
    }),

    getUserTripHistory: builder.query<
      { success: boolean; data: TBooking[] },
      {}
    >({
      query: () => "/booking/history",
    }),

    getUserCurrentBookings: builder.query<
      { data: TBooking[]; success: boolean },
      {}
    >({
      query: () => "/booking/bookings",
      providesTags: ["Booking"],
    }),

    cancelBooking: builder.mutation<
      TCancelBookingResponse,
      { bookingId: string }
    >({
      query: (data) => ({ url: "/booking/cancel", body: data, method: "PUT" }),
      invalidatesTags: ["Booking"],
    }),

    cancelSeats: builder.mutation<TCancelBookingResponse, TCancelSeatsdata>({
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
