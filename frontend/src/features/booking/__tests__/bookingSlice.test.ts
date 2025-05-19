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

jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => {
    let mockBaseQuery: jest.Mock;
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
      const newBookings = [
        { id: "1", trip: "A" },
        { id: "2", trip: "B" },
      ];
      const action = setBookings(newBookings);
      const newState = bookingReducer(bookingInitialState, action);
      expect(newState.bookings).toEqual(newBookings);
    });

    describe("extraReducers", () => {
      it("should update bookings on bookBus.matchFulfilled", () => {
        const bookBusFulfilledPayload = [
          { id: "busBook1", details: "Booked successfully" },
        ];

        const action = {
          type: "bookingApi/endpoints/bookBus/fulfilled",
          payload: bookBusFulfilledPayload,
        };

        expect(bookingApi.endpoints.bookBus.matchFulfilled(action)).toBe(true);

        const state = bookingReducer(bookingInitialState, action);
        expect(state.bookings).toEqual(bookBusFulfilledPayload);
      });

      it("should not modify state if bookBus.matchFulfilled is not the action and bookings state is preserved", () => {
        const currentBookings = [{ id: "prev1", details: "Previous booking" }];
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
    const sampleBookings = [{ id: "booking1", name: "My First Booking" }];
    const mockState: MockRootState = {
      booking: {
        bookings: sampleBookings,
        loading: true,
        error: { message: "An error occurred" },
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
      expect(selectBookingError(mockState)).toEqual({
        message: "An error occurred",
      });
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
      expect(selectBookingError(initialMockState)).toBeNull();
      expect(selectBookingSuccess(initialMockState)).toBe(false);
      expect(selectBookingMessage(initialMockState)).toBe("");
    });
  });
});
