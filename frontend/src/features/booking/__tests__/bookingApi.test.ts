// @ts-nocheck
jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => mockBaseQueryFn,
}));

const mockBaseQueryFn = jest.fn(() => Promise.resolve({ data: {} }));

import { bookingApi } from "../bookingApi";
const { endpoints } = bookingApi;

describe("bookingApi endpoint definitions", () => {
  beforeEach(() => {
    mockBaseQueryFn.mockClear();
  });

  describe("bookBus mutation", () => {
    const endpointDef = bookingApi.endpoints.bookBus as any;
    it("should define the correct query configuration", () => {
      const sampleData = {
        trip_id: "trip123",
        seat_numbers: [1, 2],
        timestamp: "2025-05-19T12:00:00Z",
      };
      const queryConfig = endpointDef.query(sampleData);
      expect(queryConfig).toEqual({
        url: "/booking/book",
        method: "POST",
        body: sampleData,
      });
    });
    it('should define invalidatesTags as ["Booking"]', () => {
      expect(endpointDef.invalidatesTags).toEqual(["Booking"]);
    });
  });

  describe("getTripDetailById query", () => {
    const endpoint = endpoints.getTripDetailById;
    it("should define the correct query configuration", () => {
      const tripId = "trip456";
      const queryConfig = endpoint.definition.query(tripId);
      expect(queryConfig).toBe("/trip/trip456");
    });
  });

  describe("getUserTripHistory query", () => {
    const endpoint = endpoints.getUserTripHistory;
    it("should define the correct query configuration", () => {
      const queryConfig = endpoint.query(undefined);
      expect(queryConfig).toBe("/booking/history");
    });
  });

  describe("getUserCurrentBookings query", () => {
    const endpoint = endpoints.getUserCurrentBookings;
    it("should define the correct query configuration", () => {
      const queryConfig = endpoint.definition.query(undefined);
      expect(queryConfig).toBe("/booking/bookings");
    });
    it('should define providesTags as ["Booking"]', () => {
      expect(endpoint.providesTags).toEqual(["Booking"]);
    });
  });

  describe("cancelBooking mutation", () => {
    const endpoint = endpoints.cancelBooking;
    it("should define the correct query configuration", () => {
      const sampleData = { booking_id: "booking789", reason: "Changed plans" };
      const queryConfig = endpoint.query(sampleData);
      expect(queryConfig).toEqual({
        url: "/booking/cancel",
        method: "PUT",
        body: sampleData,
      });
    });
    it('should define invalidatesTags as ["Booking"]', () => {
      expect(endpoint.invalidatesTags).toEqual(["Booking"]);
    });
  });

  describe("cancelSeats mutation", () => {
    const endpoint = endpoints.cancelSeats;
    it("should define the correct query configuration", () => {
      const sampleData = { booking_id: "booking101", seats: [3, 4] };
      const queryConfig = endpoint.definition.query(sampleData);
      expect(queryConfig).toEqual({
        url: "/booking/cancel-seats",
        method: "PUT",
        body: sampleData,
      });
    });
    it('should define invalidatesTags as ["Booking"]', () => {
      expect(endpoint.definition.invalidatesTags).toEqual(["Booking"]);
    });
  });
});
