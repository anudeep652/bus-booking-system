import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "./authApi";
import {
  loginSuccess,
  logout,
  registerSuccess,
  setError,
  setLoading,
} from "./authSlice";
import { store } from "../../app/store";
import { TLoginRequest, TRegisterRequest } from "../../types";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: TLoginRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const result = await store
        .dispatch(authApi.endpoints.login.initiate(credentials))
        .unwrap();

      dispatch(
        loginSuccess({
          user: result.user,
          role: credentials.role,
          token: result.token,
        })
      );

      return result;
    } catch (error) {
      let errorMessage = "Login failed";

      if (typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as any)?.message || errorMessage;
      }

      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: TRegisterRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      let result = await store
        .dispatch(authApi.endpoints.register.initiate(userData))
        .unwrap();

      dispatch(
        registerSuccess({
          user: result.user,
          token: result.token,
          role: userData.role,
        })
      );

      return result;
    } catch (error) {
      let errorMessage = "Registration failed";

      if (typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as any)?.message || errorMessage;
      }

      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await store.dispatch(authApi.endpoints.logout.initiate());
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      dispatch(logout());
    }
  }
);
