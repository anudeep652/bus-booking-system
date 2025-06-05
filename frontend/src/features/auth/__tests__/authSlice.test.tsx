// @ts-nocheck
let mockBaseQuery: jest.Mock = jest.fn(() => ({ data: {} }));

jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => mockBaseQuery,
}));
import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  loginSuccess,
  registerSuccess,
  logout,
  selectAuth,
  selectUser,
  selectRole,
  selectIsAuthenticated,
} from "../authSlice";
import {
  TAuthState,
  TLoginSuccessPayload,
  TUserData,
  TUserRole,
} from "../../../types";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("auth slice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    localStorageMock.clear();

    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe("initial state", () => {
    it("should handle initial state with empty localStorage", () => {
      expect(store.getState().auth).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    });

    it("should load initial state from localStorage if available", () => {
      localStorageMock.clear();
      jest.resetModules();

      const userData: TUserData = {
        id: "123",
        email: "test@example.com",
        role: "user",
      };
      localStorageMock.setItem("user", JSON.stringify(userData));
      localStorageMock.setItem("token", "test-token");

      const authSliceModule = require("../authSlice");

      const newStore = configureStore({
        reducer: {
          auth: authSliceModule.default,
        },
      });

      expect(newStore.getState().auth).toEqual({
        user: userData,
        token: "test-token",
        isAuthenticated: true,
      });
    });
  });

  describe("reducers", () => {
    it("should handle loginSuccess action", () => {
      const payload: TLoginSuccessPayload = {
        user: {
          id: "123",
          name: "John Doe",
          email: "john@example.com",
          role: "user",
        },
        token: "test-token",
        role: "user",
      };

      store.dispatch(loginSuccess(payload));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe(payload.token);

      expect(localStorage.getItem("token")).toBe(payload.token);
      expect(localStorage.getItem("user")).toBe(JSON.stringify(payload.user));
    });

    it("should handle registerSuccess action", () => {
      const payload: TLoginSuccessPayload = {
        user: {
          id: "456",
          name: "Jane Doe",
          email: "jane@example.com",
          role: "admin",
        },
        token: "register-token",
        role: "admin",
      };

      store.dispatch(registerSuccess(payload));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe(payload.token);

      expect(localStorage.getItem("token")).toBe(payload.token);
      expect(localStorage.getItem("user")).toBe(JSON.stringify(payload.user));
    });

    it("should handle logout action", () => {
      const payload: TLoginSuccessPayload = {
        user: {
          id: "123",
          email: "test@example.com",
          role: "user",
        },
        token: "test-token",
        role: "user",
      };
      store.dispatch(loginSuccess(payload));

      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("selectors", () => {
    beforeEach(() => {
      const payload: TLoginSuccessPayload = {
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
          role: "operator",
        },
        token: "selector-test-token",
        role: "operator",
      };
      store.dispatch(loginSuccess(payload));
    });

    it("should select auth state", () => {
      const state = store.getState();
      const authState = selectAuth(state);

      expect(authState).toEqual({
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
          role: "operator",
        },
        token: "selector-test-token",
        isAuthenticated: true,
      });
    });

    it("should select user", () => {
      const state = store.getState();
      const user = selectUser(state);

      expect(user).toEqual({
        id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "operator",
      });
    });

    it("should select role", () => {
      const state = store.getState();
      const role = selectRole(state);

      expect(role).toBe("operator");
    });

    it("should select isAuthenticated", () => {
      const state = store.getState();
      const isAuthenticated = selectIsAuthenticated(state);

      expect(isAuthenticated).toBe(true);
    });

    it("should handle selectRole when user is null", () => {
      store.dispatch(logout());

      const state = store.getState();
      const role = selectRole(state);

      expect(role).toBeUndefined();
    });
  });

  describe("extraReducers", () => {
    it("should test authApi.endpoints.login.matchFulfilled behavior", () => {
      const loginAction = {
        type: "authApi/executeMutation/fulfilled",
        payload: {
          user: {
            id: "789",
            email: "api@example.com",
            role: "user",
          },
          token: "api-login-token",
          role: "user",
        },
        meta: {
          arg: {
            endpointName: "login",
          },
          requestId: "abc123",
          requestStatus: "fulfilled",
        },
      };

      store.dispatch(loginAction);

      const state = store.getState().auth;

      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe("api-login-token");
    });

    it("should test authApi.endpoints.register.matchFulfilled behavior", () => {
      const registerAction = {
        type: "authApi/executeMutation/fulfilled",
        payload: {
          user: {
            id: "101",
            email: "newuser@example.com",
            role: "user",
          },
          token: "api-register-token",
          role: "user",
        },
        meta: {
          arg: {
            endpointName: "register",
          },
          requestId: "def456",
          requestStatus: "fulfilled",
        },
      };

      store.dispatch(registerAction);

      const state = store.getState().auth;

      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe("api-register-token");
    });
  });
});
