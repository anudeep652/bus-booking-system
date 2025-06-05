// @ts-nocheck
import {
  bookingReducer,
  setBookings,
  selectBookings,
  selectBookingLoading,
  selectBookingError,
  selectBookingSuccess,
  selectBookingMessage,
  initialState as bookingInitialState,
} from "../bookingSlice";
import { bookingApi } from "../bookingApi";
import { AnyAction } from "@reduxjs/toolkit";
import { TBooking } from "../../../types";

jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => {
    let mockBaseQuery: jest.Mock = jest.fn(() => ({ data: {} }));
    return mockBaseQuery;
  },
}));

interface MockRootState {
  booking: typeof bookingInitialState;
}

describe("bookingSlice", () => {
  describe("reducer", () => {
    it("should return the initial state when an unknown action is provided", () => {
      const unknownAction: AnyAction = { type: "unknown" };
      expect(bookingReducer(undefined, unknownAction)).toEqual(
        bookingInitialState
      );
    });

    it("should handle setBookings action", () => {
      const newBookings: TBooking[] = [
        {
          _id: "1",
          seats: [{ _id: "seat1", seat_number: 1, status: "booked" }],
          booking_status: "confirmed",
          payment_status: "paid",
          trip_id: {
            arrival_time: "2023-10-01T12:00:00Z",
            departure_time: "2023-10-01T10:00:00Z",
            price: 1000,
            source: "City A",
            destination: "City B",
          },
          user_id: {
            name: "user1",
            email: "user1@gmail.com",
          },
        },
        {
          _id: "2",
          seats: [{ _id: "seat2", seat_number: 2, status: "booked" }],
          booking_status: "confirmed",
          payment_status: "paid",
          trip_id: {
            arrival_time: "2023-10-01T12:00:00Z",
            departure_time: "2023-10-01T10:00:00Z",
            price: 1000,
            source: "City A",
            destination: "City B",
          },
          user_id: {
            name: "user1",
            email: "user1@gmail.com",
          },
        },
      ];
      const action = setBookings({ data: newBookings, success: true });
      const newState = bookingReducer(bookingInitialState, action);
      expect(newState.bookings).toEqual(newBookings);
    });

    describe("extraReducers", () => {
      it("should not modify state if bookBus.matchFulfilled is not the action and bookings state is preserved", () => {
        const currentBookings = [
          {
            _id: "1",
            seats: [
              { _id: "seat1", seat_number: 1, status: "booked" as const },
            ],
            booking_status: "confirmed" as const,
            payment_status: "paid" as const,
            trip_id: {
              arrival_time: "2023-10-01T12:00:00Z",
              departure_time: "2023-10-01T10:00:00Z",
              price: 1000,
              source: "City A",
              destination: "City B",
            },
            user_id: {
              name: "user1",
              email: "user1@gmail.com",
            },
          },
          {
            _id: "2",
            seats: [
              { _id: "seat2", seat_number: 2, status: "booked" as const },
            ],
            booking_status: "confirmed" as const,
            payment_status: "paid" as const,
            trip_id: {
              arrival_time: "2023-10-01T12:00:00Z",
              departure_time: "2023-10-01T10:00:00Z",
              price: 1000,
              source: "City A",
              destination: "City B",
            },
            user_id: {
              name: "user1",
              email: "user1@gmail.com",
            },
          },
        ];
        const currentState = {
          ...bookingInitialState,
          bookings: currentBookings,
        };

        const unrelatedAction: AnyAction = {
          type: "some/otherAction",
          payload: { data: "irrelevant" },
        };

        expect(
          bookingApi.endpoints.bookBus.matchFulfilled(unrelatedAction)
        ).toBe(false);

        const newState = bookingReducer(currentState, unrelatedAction);
        expect(newState.bookings).toEqual(currentBookings);
        expect(newState.bookings).not.toEqual(unrelatedAction.payload);
      });
    });
  });

  describe("selectors", () => {
    const sampleBookings = [
      {
        _id: "1",
        seats: [{ _id: "seat1", seat_number: 1, status: "booked" as const }],
        booking_status: "confirmed" as const,
        payment_status: "paid" as const,
        trip_id: {
          arrival_time: "2023-10-01T12:00:00Z",
          departure_time: "2023-10-01T10:00:00Z",
          price: 1000,
          source: "City A",
          destination: "City B",
        },
        user_id: {
          name: "user1",
          email: "user1@gmail.com",
        },
      },
      {
        _id: "2",
        seats: [{ _id: "seat2", seat_number: 2, status: "booked" as const }],
        booking_status: "confirmed" as const,
        payment_status: "paid" as const,
        trip_id: {
          arrival_time: "2023-10-01T12:00:00Z",
          departure_time: "2023-10-01T10:00:00Z",
          price: 1000,
          source: "City A",
          destination: "City B",
        },
        user_id: {
          name: "user1",
          email: "user1@gmail.com",
        },
      },
    ];
    const mockState: MockRootState = {
      booking: {
        bookings: sampleBookings,
        loading: true,
        error: "An error occurred",
        success: false,
        message: "Processing...",
      },
    };

    it("selectBookings should return the bookings array", () => {
      expect(selectBookings(mockState)).toEqual(sampleBookings);
    });

    it("selectBookingLoading should return the loading state", () => {
      expect(selectBookingLoading(mockState)).toBe(true);
    });

    it("selectBookingError should return the error object", () => {
      expect(selectBookingError(mockState)).toEqual("An error occurred");
    });

    it("selectBookingSuccess should return the success state", () => {
      expect(selectBookingSuccess(mockState)).toBe(false);
    });

    it("selectBookingMessage should return the message string", () => {
      expect(selectBookingMessage(mockState)).toBe("Processing...");
    });

    it("selectors should return initial values if state is initial", () => {
      const initialMockState: MockRootState = {
        booking: bookingInitialState,
      };
      expect(selectBookings(initialMockState)).toEqual([]);
      expect(selectBookingLoading(initialMockState)).toBe(false);
      expect(selectBookingError(initialMockState)).toBe("");
      expect(selectBookingSuccess(initialMockState)).toBe(false);
      expect(selectBookingMessage(initialMockState)).toBe("");
    });
  });
});
