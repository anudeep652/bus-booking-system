import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { TBus } from "../../types/bus";
import { busApi } from "./busApi";

const initialState: {
  bus: TBus | null;
  buses: TBus[];
} = {
  bus: null,
  buses: [],
};

export const busSlice = createSlice({
  name: "bus",
  initialState,
  reducers: {
    setBus: (state, action: PayloadAction<TBus>) => {
      state.bus = action.payload;
    },
    setBuses: (
      state,
      action: PayloadAction<{ success: Boolean; data: TBus[] }>
    ) => {
      state.buses = action.payload.data;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      busApi.endpoints.getBuses.matchFulfilled,
      busSlice.caseReducers.setBuses
    );
  },
});

export const { setBus, setBuses } = busSlice.actions;

export const selectBus = (state: RootState) => state.bus.bus;
export const selectBuses = (state: RootState) => state.bus.buses;

export const busReducer = busSlice.reducer;
