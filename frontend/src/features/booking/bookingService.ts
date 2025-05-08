import { createAsyncThunk } from "@reduxjs/toolkit";
import { bookingApi } from "./bookingApi";
import { TBookingData } from "../../types";
import { setError, setSuccess } from "./bookingSlice";

export const bookBusService = createAsyncThunk(
  "booking/bookBus",
  async (data: TBookingData, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        bookingApi.endpoints.bookBus.initiate(data)
      ).unwrap();
      if (result.success) {
        console.log("Booking successful:", result.data);
        dispatch(setSuccess(true));
      }
      return result;
    } catch (error) {
      dispatch(setError("Booking failed: " + error));
      return rejectWithValue("Failed to book bus");
    }
  }
);
