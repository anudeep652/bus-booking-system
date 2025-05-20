import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { bookingApi } from "./bookingApi";
import { TBooking, TBookingData, TBookingResponse } from "../../types";

export const initialState = {
  bookings: [] as TBooking[],
  loading: false,
  error: "",
  success: false,
  message: "",
};

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookings: (
      state,
      action: PayloadAction<{ data: TBooking[]; success: boolean }>
    ) => {
      state.bookings = action.payload.data;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      bookingApi.endpoints.getUserCurrentBookings.matchFulfilled,
      bookingSlice.caseReducers.setBookings
    );
  },
});

export const { setBookings } = bookingSlice.actions;
export const selectBookings = (state: RootState) => state.booking.bookings;
export const selectBookingLoading = (state: RootState) => state.booking.loading;
export const selectBookingError = (state: RootState) => state.booking.error;
export const selectBookingSuccess = (state: RootState) => state.booking.success;
export const selectBookingMessage = (state: RootState) => state.booking.message;

export const bookingReducer = bookingSlice.reducer;
