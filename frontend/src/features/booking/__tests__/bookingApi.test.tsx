// @ts-nocheck
let mockBaseQuery: jest.Mock = jest.fn(() => ({ data: {} }));

jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => mockBaseQuery,
}));

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import {
  bookingApi,
  useBookBusMutation,
  useGetTripDetailByIdQuery,
  useGetUserTripHistoryQuery,
  useGetUserCurrentBookingsQuery,
  useCancelBookingMutation,
  useCancelSeatsMutation,
} from "../bookingApi";
import { store } from "../../../app/store";

const mockTripDetails = {
  id: "trip-1",
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

const mockBookingHistory = [
  {
    id: "booking-1",
    tripId: "trip-1",
    seatNumbers: [1, 2, 3],
    status: "completed",
    bookingDate: "2023-09-01T10:00:00Z",
    totalAmount: 3600,
  },
  {
    id: "booking-2",
    tripId: "trip-2",
    seatNumbers: [4, 5],
    status: "completed",
    bookingDate: "2023-09-15T11:30:00Z",
    totalAmount: 3000,
  },
];

const mockCurrentBookings = [
  {
    id: "booking-3",
    tripId: "trip-3",
    seatNumbers: [10, 11],
    status: "confirmed",
    bookingDate: "2023-10-01T09:15:00Z",
    totalAmount: 2400,
  },
];

const mockSuccessResponse = {
  success: true,
  message: "Operation successful",
  data: { id: "booking-3" },
};

jest.mock("../bookingApi", () => {
  const originalModule = jest.requireActual("../bookingApi");

  return {
    __esModule: true,
    ...originalModule,
    bookingApi: {
      ...originalModule.bookingApi,
      endpoints: {
        bookBus: {
          ...originalModule.bookingApi.endpoints.bookBus,
          initiate: jest.fn(),
        },
        getTripDetailById: {
          ...originalModule.bookingApi.endpoints.getTripDetailById,
          initiate: jest.fn(),
        },
        getUserTripHistory: {
          ...originalModule.bookingApi.endpoints.getUserTripHistory,
          initiate: jest.fn(),
        },
        getUserCurrentBookings: {
          ...originalModule.bookingApi.endpoints.getUserCurrentBookings,
          initiate: jest.fn(),
        },
        cancelBooking: {
          ...originalModule.bookingApi.endpoints.cancelBooking,
          initiate: jest.fn(),
        },
        cancelSeats: {
          ...originalModule.bookingApi.endpoints.cancelSeats,
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
    useBookBusMutation: jest.fn(),
    useGetTripDetailByIdQuery: jest.fn(),
    useGetUserTripHistoryQuery: jest.fn(),
    useGetUserCurrentBookingsQuery: jest.fn(),
    useCancelBookingMutation: jest.fn(),
    useCancelSeatsMutation: jest.fn(),
  };
});

const createTestStore = () => {
  const store = configureStore({
    reducer: {
      [bookingApi.reducerPath]: bookingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(bookingApi.middleware),
  });

  setupListeners(store.dispatch);
  return store;
};

const wrapper = ({ children }) => {
  const store = createTestStore();
  return <Provider store={store}>{children}</Provider>;
};

describe("Booking API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("bookingApi has the correct endpoints", () => {
    const { bookingApi: originalBookingApi } =
      jest.requireActual("../bookingApi");
    expect(originalBookingApi.endpoints.bookBus).toBeDefined();
    expect(originalBookingApi.endpoints.getTripDetailById).toBeDefined();
    expect(originalBookingApi.endpoints.getUserTripHistory).toBeDefined();
    expect(originalBookingApi.endpoints.getUserCurrentBookings).toBeDefined();
    expect(originalBookingApi.endpoints.cancelBooking).toBeDefined();
    expect(originalBookingApi.endpoints.cancelSeats).toBeDefined();
  });

  describe("bookBus mutation", () => {
    test("handles booking successfully", async () => {
      const mockTrigger = jest.fn().mockResolvedValue({
        data: mockSuccessResponse,
      });

      useBookBusMutation.mockReturnValue([
        mockTrigger,
        {
          data: mockSuccessResponse,
          isLoading: false,
          isSuccess: true,
          isError: false,
        },
      ]);

      const bookingData = {
        trip_id: "trip-1",
        seat_numbers: [1, 2, 3],
        timestamp: "2023-10-05T12:00:00Z",
      };

      const { result } = renderHook(() => useBookBusMutation());

      const [trigger, state] = result.current;

      await trigger(bookingData);

      expect(mockTrigger).toHaveBeenCalledWith(bookingData);
      expect(state.isSuccess).toBeTruthy();
      expect(state.data).toEqual(mockSuccessResponse);
    });

    test("handles booking error", async () => {
      const error = {
        status: 400,
        data: { message: "Invalid seats selected" },
      };

      const mockTrigger = jest.fn().mockRejectedValue(error);

      useBookBusMutation.mockReturnValue([
        mockTrigger,
        {
          data: undefined,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error,
        },
      ]);

      const bookingData = {
        trip_id: "trip-1",
        seat_numbers: [1, 2, 3],
        timestamp: "2023-10-05T12:00:00Z",
      };

      const { result } = renderHook(() => useBookBusMutation());

      const [trigger, state] = result.current;

      try {
        await trigger(bookingData);
      } catch (e) {}

      expect(mockTrigger).toHaveBeenCalledWith(bookingData);
      expect(state.isError).toBeTruthy();
      expect(state.error).toEqual(error);
    });
  });

  describe("getTripDetailById query", () => {
    test("returns trip details successfully", async () => {
      useGetTripDetailByIdQuery.mockReturnValue({
        data: mockTripDetails,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetTripDetailByIdQuery("trip-1"));

      expect(useGetTripDetailByIdQuery).toHaveBeenCalledWith("trip-1");
      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.data).toEqual(mockTripDetails);
    });

    test("handles loading state", async () => {
      useGetTripDetailByIdQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetTripDetailByIdQuery("trip-1"));

      expect(result.current.isLoading).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    test("handles error response", async () => {
      useGetTripDetailByIdQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: { status: 404, data: { message: "Trip not found" } },
      });

      const { result } = renderHook(() =>
        useGetTripDetailByIdQuery("invalid-trip")
      );

      expect(result.current.isError).toBeTruthy();
      expect(result.current.error).toBeDefined();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("getUserTripHistory query", () => {
    test("returns user trip history successfully", async () => {
      useGetUserTripHistoryQuery.mockReturnValue({
        data: mockBookingHistory,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetUserTripHistoryQuery({}));

      expect(useGetUserTripHistoryQuery).toHaveBeenCalled();
      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.data).toEqual(mockBookingHistory);
    });

    test("handles loading state", async () => {
      useGetUserTripHistoryQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetUserTripHistoryQuery({}));

      expect(result.current.isLoading).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("getUserCurrentBookings query", () => {
    test("returns current bookings successfully", async () => {
      useGetUserCurrentBookingsQuery.mockReturnValue({
        data: mockCurrentBookings,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      });

      const { result } = renderHook(() => useGetUserCurrentBookingsQuery({}));

      expect(useGetUserCurrentBookingsQuery).toHaveBeenCalled();
      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.data).toEqual(mockCurrentBookings);
    });
  });

  describe("cancelBooking mutation", () => {
    test("handles cancellation successfully", async () => {
      const mockTrigger = jest.fn().mockResolvedValue({
        data: { success: true, message: "Booking cancelled successfully" },
      });

      useCancelBookingMutation.mockReturnValue([
        mockTrigger,
        {
          data: { success: true, message: "Booking cancelled successfully" },
          isLoading: false,
          isSuccess: true,
          isError: false,
        },
      ]);

      const { result } = renderHook(() => useCancelBookingMutation());

      const [trigger, state] = result.current;

      await trigger({ booking_id: "booking-3" });

      expect(mockTrigger).toHaveBeenCalledWith({ booking_id: "booking-3" });
      expect(state.isSuccess).toBeTruthy();
    });
  });

  describe("cancelSeats mutation", () => {
    test("handles seat cancellation successfully", async () => {
      const mockTrigger = jest.fn().mockResolvedValue({
        data: { success: true, message: "Seats cancelled successfully" },
      });

      useCancelSeatsMutation.mockReturnValue([
        mockTrigger,
        {
          data: { success: true, message: "Seats cancelled successfully" },
          isLoading: false,
          isSuccess: true,
          isError: false,
        },
      ]);

      const cancelData = {
        booking_id: "booking-3",
        seat_numbers: [10],
      };

      const { result } = renderHook(() => useCancelSeatsMutation());

      const [trigger, state] = result.current;

      await trigger(cancelData);

      expect(mockTrigger).toHaveBeenCalledWith(cancelData);
      expect(state.isSuccess).toBeTruthy();
    });
  });

  describe("with mocked baseQuery", () => {
    beforeEach(() => {
      jest.resetModules();
      jest.unmock("../bookingApi");
    });

    test("bookBus passes the correct data to baseQuery", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: mockSuccessResponse,
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { bookingApi } = require("../bookingApi");

      const store = configureStore({
        reducer: {
          [bookingApi.reducerPath]: bookingApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(bookingApi.middleware),
      });

      const bookingData = {
        trip_id: "trip-1",
        seat_numbers: [1, 2, 3],
        timestamp: "2023-10-05T12:00:00Z",
      };

      await store.dispatch(bookingApi.endpoints.bookBus.initiate(bookingData));

      expect(mockBaseQuery).toHaveBeenCalled();

      const callArgs = mockBaseQuery.mock.calls[0][0];

      expect(callArgs).toMatchObject({
        url: "/booking/book",
        method: "POST",
        body: bookingData,
      });
    });

    test("getTripDetailById passes the correct id to baseQuery", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: mockTripDetails,
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { bookingApi } = require("../bookingApi");

      const store = configureStore({
        reducer: {
          [bookingApi.reducerPath]: bookingApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(bookingApi.middleware),
      });

      await store.dispatch(
        bookingApi.endpoints.getTripDetailById.initiate("trip-1")
      );

      expect(mockBaseQuery).toHaveBeenCalled();

      const callArgs = mockBaseQuery.mock.calls[0][0];

      expect(callArgs).toMatch("/trip/trip-1");
    });

    test("cancelBooking passes the correct data to baseQuery", async () => {
      const mockBaseQuery = jest.fn().mockResolvedValue({
        data: { success: true, message: "Booking cancelled successfully" },
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { bookingApi } = require("../bookingApi");

      const store = configureStore({
        reducer: {
          [bookingApi.reducerPath]: bookingApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(bookingApi.middleware),
      });

      const cancelData = { booking_id: "booking-3" };

      await store.dispatch(
        bookingApi.endpoints.cancelBooking.initiate(cancelData)
      );

      expect(mockBaseQuery).toHaveBeenCalled();

      const callArgs = mockBaseQuery.mock.calls[0][0];

      expect(callArgs).toMatchObject({
        url: "/booking/cancel",
        method: "PUT",
        body: cancelData,
      });
    });
  });

  describe("Booking API Integration Tests", () => {
    let store;
    let api = bookingApi;

    beforeEach(() => {
      jest.resetModules();

      const mockBaseQuery = jest.fn((request) => {
        return Promise.resolve({ data: { request } });
      });

      jest.mock("../../baseQuery", () => ({
        createBaseQuery: () => mockBaseQuery,
      }));

      const { bookingApi: importedApi } = require("../bookingApi");
      api = importedApi;

      store = configureStore({
        reducer: {
          [api.reducerPath]: api.reducer,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(api.middleware),
      });
    });

    test("getUserTripHistory sends correct request", async () => {
      const result = await store.dispatch(
        api.endpoints.getUserTripHistory.initiate({})
      );

      expect(result.data.request).toBe("/booking/history");
    });

    test("getUserCurrentBookings sends correct request", async () => {
      const result = await store.dispatch(
        api.endpoints.getUserCurrentBookings.initiate({})
      );

      expect(result.data.request).toBe("/booking/bookings");
    });

    test("cancelSeats sends correct request", async () => {
      const cancelData = {
        bookingId: "booking-3",
        seatNumbers: [10],
      };

      const result = await store.dispatch(
        api.endpoints.cancelSeats.initiate(cancelData)
      );

      expect(result.data.request).toEqual({
        url: "/booking/cancel-seats",
        method: "PUT",
        body: cancelData,
      });
    });
  });
});
