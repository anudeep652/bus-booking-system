import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  success: false,
  message: "",
};

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
  },
});

export const { setBookings, setLoading, setError, setSuccess, setMessage } =
  bookingSlice.actions;
export const selectBookings = (state: RootState) => state.booking.bookings;
export const selectBookingLoading = (state: RootState) => state.booking.loading;
export const selectBookingError = (state: RootState) => state.booking.error;
export const selectBookingSuccess = (state: RootState) => state.booking.success;
export const selectBookingMessage = (state: RootState) => state.booking.message;

export const bookingReducer = bookingSlice.reducer;
