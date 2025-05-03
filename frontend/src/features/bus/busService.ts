import { createAsyncThunk } from "@reduxjs/toolkit";
import { setBuses, setLoading } from "./busSlice";
import { store } from "../../app/store";
import { busApi } from "./busApi";
import { TBusSearch } from "../../types/bus";

export const getBusses = createAsyncThunk(
  "bus/getBuses",
  async (params: TBusSearch, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const result = await store
        .dispatch(busApi.endpoints.getBuses.initiate(params))
        .unwrap();
      console.log(result);
      dispatch(setBuses(result.data));
    } catch (error) {
      dispatch(setLoading(false));
      return rejectWithValue("Failed to fetch buses");
    }
    dispatch(setLoading(false));
  }
);
