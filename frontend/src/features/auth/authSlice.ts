import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { TAuthState, TLoginSuccessPayload, TUserRole } from "../../types";

const initialState: TAuthState = {
  user: localStorage.getItem("user")
    ? (JSON.parse(localStorage.getItem("user") as string) as TAuthState["user"])
    : null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
  role: localStorage.getItem("role") as TUserRole | null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<TLoginSuccessPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
      state.role = action.payload.role;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("role", action.payload.role);
    },
    registerSuccess: (state, action: PayloadAction<TLoginSuccessPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("role", action.payload.role);
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.role = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  registerSuccess,
  logout,
  clearError,
} = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectRole = (state: RootState) => state.auth.role;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
