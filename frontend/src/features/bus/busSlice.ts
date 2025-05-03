import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { TBus } from "../../types/bus";

const initialState: {
  isLoading: boolean;
  error: string | null;
  bus: TBus | null;
  buses: TBus[];
} = {
  isLoading: false,
  error: null,
  bus: null,
  buses: [],
};

export const busSlice = createSlice({
  name: "bus",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setBus: (state, action) => {
      state.bus = action.payload;
    },
    setBuses: (state, action) => {
      state.buses = action.payload;
    },
  },
});

export const { setLoading, setError, setBus, setBuses } = busSlice.actions;

export const selectBus = (state: RootState) => state.bus.bus;
export const selectBuses = (state: RootState) => state.bus.buses;
export const selectBusLoading = (state: RootState) => state.bus.isLoading;
export const selectBusError = (state: RootState) => state.bus.error;

export const busReducer = busSlice.reducer;
