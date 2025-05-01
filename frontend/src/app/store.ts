import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import { authApi } from "../features/auth/authApi";
import { authMiddleware } from "../features/auth/authMiddleware";
import { busReducer } from "../features/bus/busSlice";
import { busApi } from "../features/bus/busApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    bus: busReducer,
    [busApi.reducerPath]: busApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      busApi.middleware,
      authMiddleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
