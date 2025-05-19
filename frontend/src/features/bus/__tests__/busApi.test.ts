import { configureStore } from "@reduxjs/toolkit";
import { busApi } from "../busApi";
import type { TBusSearchParams } from "../../../types";
let mockBaseQuery: jest.Mock;

jest.mock("../../baseQuery", () => ({
  createBaseQuery: () => mockBaseQuery,
}));

describe("busApi", () => {
  const store = configureStore({
    reducer: {
      [busApi.reducerPath]: busApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(busApi.middleware),
  });

  beforeEach(() => {
    mockBaseQuery = jest.fn(() => ({ data: {} }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBuses", () => {
    it("should make correct API call with parameters", async () => {
      const searchParams: TBusSearchParams = {
        source: "City A",
        destination: "City B",
        startDate: "2023-01-01",
        endDate: "2023-01-02",
        minPrice: "100",
        maxPrice: "1000",
        busType: "AC",
        ratings: "4",
      };

      await store.dispatch(busApi.endpoints.getBuses.initiate(searchParams));

      expect(mockBaseQuery).toHaveBeenCalledWith(
        {
          url: "/trip/search",
          method: "GET",
          params: {
            source: "City A",
            destination: "City B",
            startDate: "2023-01-01",
            endDate: "2023-01-02",
            minPrice: 100,
            maxPrice: 1000,
            busType: "AC",
          },
        },
        expect.any(Object),
        expect.any(Object)
      );
    });

    it("should handle missing optional parameters", async () => {
      // @ts-ignore
      const searchParams: TBusSearchParams = {
        source: "City A",
        destination: "City B",
        startDate: "2023-01-01",
      };

      await store.dispatch(busApi.endpoints.getBuses.initiate(searchParams));

      expect(mockBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            source: "City A",
            destination: "City B",
            startDate: "2023-01-01",
          }),
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe("getBusById", () => {
    it("should make correct API call with ID", async () => {
      const testId = "12345";
      await store.dispatch(busApi.endpoints.getBusById.initiate(testId));

      expect(mockBaseQuery).toHaveBeenCalledWith(
        {
          url: `/buses/${testId}`,
          method: "GET",
        },
        expect.any(Object),
        expect.any(Object)
      );
    });

    it("should handle empty ID", async () => {
      const emptyId = "";
      await store.dispatch(busApi.endpoints.getBusById.initiate(emptyId));

      expect(mockBaseQuery).toHaveBeenCalledWith(
        {
          url: "/buses/",
          method: "GET",
        },
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
});
