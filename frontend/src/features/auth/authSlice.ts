import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { TAuthState, TLoginSuccessPayload } from "../../types";
import { authApi } from "./authApi";

const initialState: TAuthState = {
  user: localStorage.getItem("user")
    ? (JSON.parse(localStorage.getItem("user") as string) as TAuthState["user"])
    : null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<TLoginSuccessPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    registerSuccess: (state, action: PayloadAction<TLoginSuccessPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        authSlice.caseReducers.loginSuccess
      )

      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        authSlice.caseReducers.registerSuccess
      );
  },
});

export const { loginSuccess, registerSuccess, logout } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectRole = (state: RootState) => state.auth.user?.role;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
