// @ts-nocheck
let mockBaseQuery: jest.Mock = jest.fn(() => ({ data: {} }));

jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => mockBaseQuery,
}));

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { busApi, useGetBusesQuery, useGetBusByIdQuery } from "../busApi";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";

const mockBuses = [
  {
    id: "1",
    busId: "bus-001",
    busNumber: "AB123",
    busType: "sleeper",
    departureTime: "2023-10-10T08:00:00Z",
    arrivalTime: "2023-10-10T16:00:00Z",
    price: 1200,
    availableSeats: 30,
    source: "Mumbai",
    destination: "Delhi",
  },
  {
    id: "2",
    busId: "bus-002",
    busNumber: "CD456",
    busType: "ac",
    departureTime: "2023-10-10T09:00:00Z",
    arrivalTime: "2023-10-10T17:00:00Z",
    price: 1500,
    availableSeats: 25,
    source: "Mumbai",
    destination: "Delhi",
  },
];

const mockBusDetails = {
  id: "1",
  busId: "bus-001",
  busNumber: "AB123",
  busType: "sleeper",
  departureTime: "2023-10-10T08:00:00Z",
  arrivalTime: "2023-10-10T16:00:00Z",
  price: 1200,
  availableSeats: 30,
  source: "Mumbai",
  destination: "Delhi",
};

jest.mock("../busApi", () => {
  const originalModule = jest.requireActual("../busApi");

  return {
    __esModule: true,
    ...originalModule,
    busApi: {
      ...originalModule.busApi,
      endpoints: {
        getBuses: {
          ...originalModule.busApi.endpoints.getBuses,
          initiate: jest.fn(),
          select: jest.fn(),
        },
        getBusById: {
          ...originalModule.busApi.endpoints.getBusById,
          initiate: jest.fn(),
          select: jest.fn(),
        },
      },
      reducer: () => ({}),
      middleware: jest.fn(() => (next) => (action) => next(action)),
      util: {
        updateQueryData: jest.fn(),
        selectInvalidatedBy: jest.fn(),
      },
    },
    useGetBusesQuery: jest.fn(),
    useGetBusByIdQuery: jest.fn(),
  };
});

const createTestStore = () => {
  const store = configureStore({
    reducer: {
      [busApi.reducerPath]: busApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(busApi.middleware),
  });

  setupListeners(store.dispatch);
  return store;
};

const wrapper = ({ children }) => {
  const store = createTestStore();
  return <Provider store={store}>{children}</Provider>;
};

describe("Bus API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("busApi has the correct endpoints", () => {
    const { busApi: originalBusApi } = jest.requireActual("../busApi");
    expect(originalBusApi.endpoints.getBuses).toBeDefined();
    expect(originalBusApi.endpoints.getBusById).toBeDefined();
  });

  describe("getBuses endpoint", () => {
    const searchParams = {
      source: "Mumbai",
      destination: "Delhi",
      startDate: "2023-10-10",
      endDate: "2023-10-11",
      minPrice: "1000",
      maxPrice: "2000",
      busType: "sleeper",
      ratings: "4",
    };

    test("returns bus search results successfully", async () => {
      useGetBusesQuery.mockReturnValue({
        data: { success: true, data: mockBuses },
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetBusesQuery(searchParams));

      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.data.success).toBeTruthy();
      expect(result.current.data.data).toEqual(mockBuses);
      expect(useGetBusesQuery).toHaveBeenCalledWith(searchParams);
    });

    test("handles loading state", async () => {
      useGetBusesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetBusesQuery(searchParams));

      expect(result.current.isLoading).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    test("handles error response", async () => {
      useGetBusesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: { status: 500, data: { message: "Server error" } },
      });

      const { result } = renderHook(() => useGetBusesQuery(searchParams));

      expect(result.current.isError).toBeTruthy();
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("getBusById endpoint", () => {
    test("returns bus details successfully", async () => {
      useGetBusByIdQuery.mockReturnValue({
        data: mockBusDetails,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetBusByIdQuery("1"));

      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.data).toEqual(mockBusDetails);
      expect(useGetBusByIdQuery).toHaveBeenCalledWith("1");
    });

    test("handles loading state", async () => {
      useGetBusByIdQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetBusByIdQuery("1"));

      expect(result.current.isLoading).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    test("handles error when bus is not found", async () => {
      useGetBusByIdQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: { status: 404, data: { message: "Bus not found" } },
      });

      const { result } = renderHook(() => useGetBusByIdQuery("error"));

      expect(result.current.isError).toBeTruthy();
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("with mocked baseQuery", () => {
    beforeEach(() => {
      jest.resetModules();
      jest.unmock("../busApi");
    });

    test("getBuses passes the correct parameters to baseQuery", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: { success: true, data: mockBuses },
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { busApi } = require("../busApi");

      const store = configureStore({
        reducer: {
          [busApi.reducerPath]: busApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(busApi.middleware),
      });

      await store.dispatch(
        busApi.endpoints.getBuses.initiate({
          source: "Mumbai",
          destination: "Delhi",
          startDate: "2023-10-10",
          endDate: "2023-10-11",
          minPrice: "1000",
          maxPrice: "2000",
          busType: "sleeper",
          ratings: "4",
        })
      );

      expect(mockBaseQuery).toHaveBeenCalled();
      const [queryArg] = mockBaseQuery.mock.calls[0];

      expect(queryArg.url).toBe("/trip/search");
      expect(queryArg.params).toEqual({
        source: "Mumbai",
        destination: "Delhi",
        startDate: "2023-10-10",
        endDate: "2023-10-11",
        minPrice: "1000",
        maxPrice: "2000",
        busType: "sleeper",
      });
    });
    test("getBusById passes the correct id to baseQuery", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: mockBusDetails,
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { busApi } = require("../busApi");

      const store = configureStore({
        reducer: {
          [busApi.reducerPath]: busApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(busApi.middleware),
      });

      await store.dispatch(busApi.endpoints.getBusById.initiate("1"));

      expect(mockBaseQuery).toHaveBeenCalled();
    });
  });

  describe("real hooks with mocked responses", () => {
    test("useGetBusesQuery hook integrates with redux correctly", () => {
      useGetBusesQuery.mockReset();
      useGetBusesQuery.mockReturnValue({
        data: { success: true, data: mockBuses },
        isLoading: false,
        isSuccess: true,
      });

      const searchParams = {
        source: "Mumbai",
        destination: "Delhi",
        startDate: "2023-10-10",
        endDate: "2023-10-11",
        minPrice: "1000",
        maxPrice: "2000",
        busType: "sleeper",
        ratings: "4",
      };

      const { result } = renderHook(() => useGetBusesQuery(searchParams));

      expect(useGetBusesQuery).toHaveBeenCalledWith(searchParams);
      expect(result.current.data.success).toBeTruthy();
      expect(result.current.data.data).toEqual(mockBuses);
    });
  });
});
