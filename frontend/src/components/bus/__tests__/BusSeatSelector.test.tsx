// @ts-nocheck
jest.mock("../../../features/baseQuery", () => ({
  createBaseQuery: () => () => ({
    baseUrl: "http://localhost:8000/api/v1",
  }),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import BusSeatSelector from "../BusSeatSelector";
import { useGetTripDetailByIdQuery } from "../../../features/booking/bookingApi";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

jest.mock("../../../app/hooks", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("../../../features/booking/bookingApi", () => ({
  useGetTripDetailByIdQuery: jest.fn(),
}));

jest.mock("../SeatSummary", () => ({
  SeatSummary: jest.fn(({ selectedSeats, busDetails, clearSelectedSeats }) => (
    <div data-testid="seat-summary">
      <p>Selected Seats: {selectedSeats.join(", ")}</p>
      <button data-testid="clear-button" onClick={clearSelectedSeats}>
        Clear
      </button>
    </div>
  )),
}));

const mockStore = configureStore([]);

describe("BusSeatSelector Component", () => {
  const mockBusData = {
    name: "Express Bus",
    price: 25,
  };

  const mockTripData = {
    data: {
      totalSeats: 20,
      seatsPerRow: 4,
      unavailableSeats: [3, 7, 15],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    require("react-router-dom").useParams.mockReturnValue({ id: "123" });

    console.log = jest.fn();

    require("../../../app/hooks").useAppSelector.mockReturnValue(mockBusData);

    useGetTripDetailByIdQuery.mockReturnValue({
      data: mockTripData,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  test("renders loading state correctly", () => {
    useGetTripDetailByIdQuery.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
      error: null,
    });

    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("handles seats beyond total seat count", () => {
    useGetTripDetailByIdQuery.mockReturnValue({
      data: {
        data: {
          totalSeats: 19,
          seatsPerRow: 4,
          unavailableSeats: [3, 7],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("19")).toBeInTheDocument();

    expect(screen.queryByText("20")).not.toBeInTheDocument();
  });
  test("passes the correct tripId to useGetTripDetailByIdQuery", () => {
    require("react-router-dom").useParams.mockReturnValue({ id: "123" });

    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    expect(useGetTripDetailByIdQuery).toHaveBeenCalledWith("123");
  });

  test("renders error state correctly", () => {
    useGetTripDetailByIdQuery.mockReturnValue({
      isLoading: false,
      isError: true,
      data: null,
      error: { message: "API Error" },
    });

    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });

  test("renders no data available message when data is null", () => {
    useGetTripDetailByIdQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: null,
      error: null,
    });

    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("No trip data available.")).toBeInTheDocument();
  });

  test("renders the correct number of seats based on trip data", () => {
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    for (let i = 1; i <= 20; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test("unavailable seats are disabled", () => {
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    const seat3Button = screen.getByText("3").closest("button");
    const seat7Button = screen.getByText("7").closest("button");
    const seat15Button = screen.getByText("15").closest("button");

    expect(seat3Button).toBeDisabled();
    expect(seat7Button).toBeDisabled();
    expect(seat15Button).toBeDisabled();

    const seat1Button = screen.getByText("1").closest("button");
    expect(seat1Button).not.toBeDisabled();
  });

  test("clicking on available seats toggles their selection", () => {
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("seat-summary")).toHaveTextContent(
      "Selected Seats:"
    );

    const seat1Button = screen.getByText("1").closest("button");
    fireEvent.click(seat1Button);

    expect(screen.getByTestId("seat-summary")).toHaveTextContent(
      "Selected Seats: 1"
    );

    const seat2Button = screen.getByText("2").closest("button");
    fireEvent.click(seat2Button);

    expect(screen.getByTestId("seat-summary")).toHaveTextContent(
      "Selected Seats: 1, 2"
    );

    fireEvent.click(seat1Button);

    expect(screen.getByTestId("seat-summary")).toHaveTextContent(
      "Selected Seats: 2"
    );
  });

  test("clicking on unavailable seats does nothing", () => {
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    const seat3Button = screen.getByText("3").closest("button");
    fireEvent.click(seat3Button);

    expect(screen.getByTestId("seat-summary")).toHaveTextContent(
      "Selected Seats:"
    );
  });

  test("clear button resets selected seats", () => {
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    const seat1Button = screen.getByText("1").closest("button");
    const seat2Button = screen.getByText("2").closest("button");
    fireEvent.click(seat1Button);
    fireEvent.click(seat2Button);

    expect(screen.getByTestId("seat-summary")).toHaveTextContent(
      "Selected Seats: 1, 2"
    );

    const clearButton = screen.getByTestId("clear-button");
    fireEvent.click(clearButton);

    expect(screen.getByTestId("seat-summary")).toHaveTextContent(
      "Selected Seats:"
    );
  });

  test("renders the component with undefined ID parameter", () => {
    require("react-router-dom").useParams.mockReturnValue({});

    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    expect(useGetTripDetailByIdQuery).toHaveBeenCalledWith("");
  });

  test("renders the correct layout for multiple rows", () => {
    useGetTripDetailByIdQuery.mockReturnValue({
      data: {
        data: {
          totalSeats: 12,
          seatsPerRow: 4,
          unavailableSeats: [3, 7],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    const rows = screen
      .getAllByText(/^\d+$/)
      .map((seat) => seat.closest("button").parentElement.parentElement)
      .filter((row, index, self) => self.indexOf(row) === index);

    expect(rows.length).toBe(3);

    for (let i = 1; i <= 4; i++) {
      expect(rows[0].textContent).toContain(i.toString());
    }

    for (let i = 5; i <= 8; i++) {
      expect(rows[1].textContent).toContain(i.toString());
    }

    for (let i = 9; i <= 12; i++) {
      expect(rows[2].textContent).toContain(i.toString());
    }
  });

  test("correctly applies CSS classes to seats based on their state", () => {
    render(
      <Provider store={mockStore({})}>
        <MemoryRouter>
          <BusSeatSelector />
        </MemoryRouter>
      </Provider>
    );

    const availableSeat = screen.getByText("1").closest("button");
    expect(availableSeat).toHaveClass("bg-white");
    expect(availableSeat).toHaveClass("border-indigo-600");

    const unavailableSeat = screen.getByText("3").closest("button");
    expect(unavailableSeat).toHaveClass("bg-gray-300");
    expect(unavailableSeat).toHaveClass("border-gray-400");
    expect(unavailableSeat).toHaveClass("cursor-not-allowed");

    fireEvent.click(availableSeat);
    expect(availableSeat).toHaveClass("bg-green-500");
    expect(availableSeat).toHaveClass("border-green-600");
  });
});
