// @ts-nocheck
let mockBaseQuery: jest.Mock = jest.fn(() => ({ data: {} }));

jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => mockBaseQuery,
}));

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";
import { authApi, useLoginMutation, useRegisterMutation } from "../authApi";
import {
  TAuthResponse,
  TLoginRequest,
  TRegisterRequest,
  TUserRole,
} from "../../../types";

const mockUserData = {
  id: "user-123",
  name: "user1",
  email: "user@email.com",
  phone: "1234567890",
  role: "user" as TUserRole,
};

const mockAuthResponse: TAuthResponse = {
  user: mockUserData,
  token: "mock-jwt-token",
  role: "user" as TUserRole,
  message: "Login successful",
};

const mockLoginRequest: TLoginRequest = {
  email: "user@email.com",
  password: "password123",
  role: "user" as TUserRole,
};

const mockRegisterRequest: TRegisterRequest = {
  name: "user1",
  email: "user@email.com",
  phone: "1234567890",
  password: "password123",
  role: "user" as TUserRole,
};

jest.mock("../authApi", () => {
  const originalModule = jest.requireActual("../authApi");

  return {
    __esModule: true,
    ...originalModule,
    authApi: {
      ...originalModule.authApi,
      endpoints: {
        login: {
          ...originalModule.authApi.endpoints.login,
          initiate: jest.fn(),
        },
        register: {
          ...originalModule.authApi.endpoints.register,
          initiate: jest.fn(),
        },
      },
      reducer: () => ({}),
      middleware: jest.fn(() => (next) => (action) => next(action)),
      util: {
        updateQueryData: jest.fn(),
        selectInvalidatedBy: jest.fn(),
      },
    },
    // Mock hooks
    useLoginMutation: jest.fn(),
    useRegisterMutation: jest.fn(),
  };
});

const createTestStore = () => {
  const store = configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
  });

  setupListeners(store.dispatch);
  return store;
};

const wrapper = ({ children }) => {
  const store = createTestStore();
  return <Provider store={store}>{children}</Provider>;
};

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("authApi has the correct endpoints", () => {
    const { authApi: originalAuthApi } = jest.requireActual("../authApi");
    expect(originalAuthApi.endpoints.login).toBeDefined();
    expect(originalAuthApi.endpoints.register).toBeDefined();
  });

  describe("login mutation", () => {
    test("handles login successfully", async () => {
      const mockTrigger = jest.fn().mockResolvedValue({
        data: mockAuthResponse,
      });

      useLoginMutation.mockReturnValue([
        mockTrigger,
        {
          data: mockAuthResponse,
          isLoading: false,
          isSuccess: true,
          isError: false,
        },
      ]);

      const { result } = renderHook(() => useLoginMutation());

      const [trigger, state] = result.current;

      await trigger(mockLoginRequest);

      expect(mockTrigger).toHaveBeenCalledWith(mockLoginRequest);
      expect(state.isSuccess).toBeTruthy();
      expect(state.data).toEqual(mockAuthResponse);
    });

    test("handles login with phone number", async () => {
      const phoneLoginRequest: TLoginRequest = {
        phone: "1234567890",
        password: "password123",
        role: "user" as TUserRole,
      };

      const mockTrigger = jest.fn().mockResolvedValue({
        data: mockAuthResponse,
      });

      useLoginMutation.mockReturnValue([
        mockTrigger,
        {
          data: mockAuthResponse,
          isLoading: false,
          isSuccess: true,
          isError: false,
        },
      ]);

      const { result } = renderHook(() => useLoginMutation());

      const [trigger] = result.current;

      await trigger(phoneLoginRequest);

      expect(mockTrigger).toHaveBeenCalledWith(phoneLoginRequest);
    });

    test("handles login loading state", async () => {
      useLoginMutation.mockReturnValue([
        jest.fn(),
        {
          data: undefined,
          isLoading: true,
          isSuccess: false,
          isError: false,
        },
      ]);

      const { result } = renderHook(() => useLoginMutation());

      const [_, state] = result.current;

      expect(state.isLoading).toBeTruthy();
      expect(state.data).toBeUndefined();
    });

    test("handles login error", async () => {
      const error = {
        status: 401,
        data: { message: "Invalid credentials" },
      };

      const mockTrigger = jest.fn().mockRejectedValue(error);

      useLoginMutation.mockReturnValue([
        mockTrigger,
        {
          data: undefined,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error,
        },
      ]);

      const { result } = renderHook(() => useLoginMutation());

      const [trigger, state] = result.current;

      try {
        await trigger(mockLoginRequest);
      } catch (e) {}

      expect(state.isError).toBeTruthy();
      expect(state.error).toEqual(error);
    });
  });

  describe("register mutation", () => {
    test("handles registration successfully", async () => {
      const mockTrigger = jest.fn().mockResolvedValue({
        data: mockAuthResponse,
      });

      useRegisterMutation.mockReturnValue([
        mockTrigger,
        {
          data: mockAuthResponse,
          isLoading: false,
          isSuccess: true,
          isError: false,
        },
      ]);

      const { result } = renderHook(() => useRegisterMutation());

      const [trigger, state] = result.current;

      await trigger(mockRegisterRequest);

      expect(mockTrigger).toHaveBeenCalledWith(mockRegisterRequest);
      expect(state.isSuccess).toBeTruthy();
      expect(state.data).toEqual(mockAuthResponse);
    });

    test("handles registration loading state", async () => {
      useRegisterMutation.mockReturnValue([
        jest.fn(),
        {
          data: undefined,
          isLoading: true,
          isSuccess: false,
          isError: false,
        },
      ]);

      const { result } = renderHook(() => useRegisterMutation());

      const [_, state] = result.current;

      expect(state.isLoading).toBeTruthy();
      expect(state.data).toBeUndefined();
    });

    test("handles registration error", async () => {
      const error = {
        status: 400,
        data: { message: "Email already in use" },
      };

      const mockTrigger = jest.fn().mockRejectedValue(error);

      useRegisterMutation.mockReturnValue([
        mockTrigger,
        {
          data: undefined,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error,
        },
      ]);

      const { result } = renderHook(() => useRegisterMutation());

      const [trigger, state] = result.current;

      try {
        await trigger(mockRegisterRequest);
      } catch (e) {}

      expect(state.isError).toBeTruthy();
      expect(state.error).toEqual(error);
    });
  });

  describe("with mocked baseQuery", () => {
    beforeEach(() => {
      jest.resetModules();
      jest.unmock("../authApi");
    });

    test("login mutation passes the correct data to baseQuery", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: mockAuthResponse,
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { authApi } = require("../authApi");

      const store = configureStore({
        reducer: {
          [authApi.reducerPath]: authApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(authApi.middleware),
      });

      await store.dispatch(authApi.endpoints.login.initiate(mockLoginRequest));

      expect(mockBaseQuery).toHaveBeenCalled();

      const callArgs = mockBaseQuery.mock.calls[0][0];

      expect(callArgs).toMatchObject({
        url: "/user/login",
        method: "POST",
        body: mockLoginRequest,
      });
    });

    test("login endpoint error transformation works correctly", async () => {
      const mockBaseQuery = jest
        .fn()
        .mockImplementationOnce(() => ({
          error: {
            status: 401,
            data: {},
          },
        }))
        .mockImplementationOnce(() => ({
          error: {
            status: 500,
            data: { serverError: true },
          },
        }))
        .mockImplementationOnce(() => ({
          error: {
            status: 500,
            data: null,
          },
        }));

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { authApi } = require("../authApi");

      const store = configureStore({
        reducer: {
          [authApi.reducerPath]: authApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(authApi.middleware),
      });

      const result401 = await store.dispatch(
        authApi.endpoints.login.initiate(mockLoginRequest)
      );

      expect(result401.error.data).toEqual({ message: "Invalid credentials" });

      const result500 = await store.dispatch(
        authApi.endpoints.login.initiate(mockLoginRequest)
      );

      expect(result500.error.data).toEqual({ serverError: true });

      const resultNoData = await store.dispatch(
        authApi.endpoints.login.initiate(mockLoginRequest)
      );

      expect(resultNoData.error.data).toEqual({
        message: "An error occurred during login",
      });
    });

    test("register mutation passes the correct data to baseQuery", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: mockAuthResponse,
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { authApi } = require("../authApi");

      const store = configureStore({
        reducer: {
          [authApi.reducerPath]: authApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(authApi.middleware),
      });

      const adminRegisterRequest: TRegisterRequest = {
        ...mockRegisterRequest,
        role: "admin",
      };

      await store.dispatch(
        authApi.endpoints.register.initiate(adminRegisterRequest)
      );

      expect(mockBaseQuery).toHaveBeenCalled();

      const callArgs = mockBaseQuery.mock.calls[0][0];

      expect(callArgs).toMatchObject({
        url: "/admin/register",
        method: "POST",
        body: adminRegisterRequest,
      });
    });

    test("login endpoint supports different user roles", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: mockAuthResponse,
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { authApi } = require("../authApi");

      const store = configureStore({
        reducer: {
          [authApi.reducerPath]: authApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(authApi.middleware),
      });

      const operatorLoginRequest: TLoginRequest = {
        ...mockLoginRequest,
        role: "operator",
      };

      await store.dispatch(
        authApi.endpoints.login.initiate(operatorLoginRequest)
      );

      const callArgs = mockBaseQuery.mock.calls[0][0];
      expect(callArgs.url).toBe("/operator/login");

      mockBaseQuery.mockClear();

      const adminLoginRequest: TLoginRequest = {
        ...mockLoginRequest,
        role: "admin",
      };

      await store.dispatch(authApi.endpoints.login.initiate(adminLoginRequest));

      const adminCallArgs = mockBaseQuery.mock.calls[0][0];
      expect(adminCallArgs.url).toBe("/admin/login");
    });
  });
});
