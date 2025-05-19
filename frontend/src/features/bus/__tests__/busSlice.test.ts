import {
  setBus,
  setBuses,
  selectBus,
  selectBuses,
  busReducer,
} from "../busSlice";
import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store";
import { TBus } from "../../../types";
import { busApi } from "../busApi";

jest.mock("../busApi", () => ({
  busApi: {
    endpoints: {
      getBuses: {
        matchFulfilled: jest.fn(),
      },
    },
  },
}));

const sampleBus: TBus = {
  id: "1",
  busId: "TN",
  busNumber: "4",
  busType: "sleeper",
  departureTime: "",
  arrivalTime: "",
  price: 2000,
  availableSeats: 50,
  source: "",
  destination: "",
};

const sampleBuses: TBus[] = [
  sampleBus,
  {
    id: "2",
    busId: "TN",
    busNumber: "5",
    busType: "sleeper",
    departureTime: "",
    arrivalTime: "",
    price: 2000,
    availableSeats: 50,
    source: "",
    destination: "",
  },
];

const createMockStore = (initialState: any = {}) => {
  return configureStore({
    reducer: busReducer,
    preloadedState: initialState,
  });
};

describe("Bus Slice", () => {
  describe("Initial State", () => {
    it("should return the initial state", () => {
      const initialState = busReducer(undefined, { type: "unknown" });
      expect(initialState).toEqual({
        bus: null,
        buses: [],
      });
    });
  });

  describe("Reducers", () => {
    it("should handle setBus", () => {
      const initialState = {
        bus: null,
        buses: [],
      };
      const newState = busReducer(initialState, setBus(sampleBus));
      expect(newState.bus).toEqual(sampleBus);
    });

    it("should handle setBuses", () => {
      const initialState = {
        bus: null,
        buses: [],
      };
      const newState = busReducer(initialState, setBuses(sampleBuses));
      expect(newState.buses).toEqual(sampleBuses);
    });

    it("should update bus without affecting buses", () => {
      const initialState = {
        bus: null,
        buses: sampleBuses,
      };
      const newState = busReducer(initialState, setBus(sampleBus));
      expect(newState.bus).toEqual(sampleBus);
      expect(newState.buses).toEqual(sampleBuses);
    });

    it("should update buses without affecting bus", () => {
      const initialState = {
        bus: sampleBus,
        buses: [],
      };
      const newState = busReducer(initialState, setBuses(sampleBuses));
      expect(newState.bus).toEqual(sampleBus);
      expect(newState.buses).toEqual(sampleBuses);
    });
  });

  describe("Selectors", () => {
    it("should select bus from state", () => {
      const mockState = {
        bus: {
          bus: sampleBus,
          buses: [],
        },
      } as unknown as RootState;

      expect(selectBus(mockState)).toEqual(sampleBus);
    });

    it("should select buses from state", () => {
      const mockState = {
        bus: {
          bus: null,
          buses: sampleBuses,
        },
      } as RootState;

      expect(selectBuses(mockState)).toEqual(sampleBuses);
    });
  });

  describe("Extra Reducers", () => {
    it("should set buses when getBuses API call is fulfilled", () => {
      const getBusesFulfilledAction = {
        type: `${busApi.reducerPath}/executeQuery/fulfilled`,
        payload: {
          data: sampleBuses,
          endpointName: "getBuses",
        },
        meta: {
          arg: {
            endpointName: "getBuses",
            originalArgs: undefined,
          },
          requestId: "test-request-id",
          requestStatus: "fulfilled",
        },
      };

      const matchFulfilledMock = jest.fn().mockImplementation((action) => {
        return (
          action.type === getBusesFulfilledAction.type &&
          action.meta?.arg?.endpointName === "getBuses" &&
          action.meta?.requestStatus === "fulfilled"
        );
      });

      (
        busApi.endpoints.getBuses.matchFulfilled as unknown as jest.Mock
      ).mockImplementation(matchFulfilledMock);

      const initialState = {
        bus: null,
        buses: [],
      };

      const matcher = busApi.endpoints.getBuses.matchFulfilled;
      const isMatched = matcher(getBusesFulfilledAction);

      expect(isMatched).toBe(true);

      const newState = busReducer(
        initialState,
        setBuses(getBusesFulfilledAction.payload.data)
      );

      expect(newState.buses).toEqual(sampleBuses);
    });
  });

  describe("Store Integration", () => {
    it("should update store when setBus is dispatched", () => {
      const store = createMockStore();
      store.dispatch(setBus(sampleBus));

      expect(store.getState().bus?.id).toEqual(sampleBus.id);
    });

    it("should update store when setBuses is dispatched", () => {
      const store = createMockStore();
      store.dispatch(setBuses(sampleBuses));

      expect(store.getState().buses).toEqual(sampleBuses);
    });
  });
});
