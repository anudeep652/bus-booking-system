import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BusSeatSelector from "../BusSeatSelector";
import { useGetTripDetailByIdQuery } from "../../../features/booking/bookingApi";
import { useAppSelector } from "../../../app/hooks";
import { useParams } from "react-router-dom";

jest.mock("../../../features/baseQuery", () => ({
  createBaseQuery: () => () => ({
    baseUrl: "http://localhost:8000/api/v1",
  }),
}));

jest.mock("../../../app/hooks", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

jest.mock("../../../features/booking/bookingApi", () => ({
  useGetTripDetailByIdQuery: jest.fn(),
}));

jest.mock("../SeatSummary", () => ({
  SeatSummary: jest
    .fn()
    .mockImplementation(({ selectedSeats, busDetails, clearSelectedSeats }) => (
      <div data-testid="seat-summary">
        <span data-testid="selected-seats-text">
          Selected seats: {selectedSeats.join(", ")}
        </span>
        <button data-testid="clear-seats" onClick={clearSelectedSeats}>
          Clear
        </button>
      </div>
    )),
}));

describe("BusSeatSelector Component", () => {
  const mockBus = {
    id: "bus1",
    name: "Express Bus",
    price: 50,
  };

  const mockTripData = {
    trip: {
      id: "trip1",
      totalSeats: 24,
      seatsPerRow: 4,
      unavailableSeats: [3, 7, 15],
    },
  };

  beforeEach(() => {
    (useAppSelector as unknown as jest.Mock).mockReturnValue(mockBus);
    (useParams as jest.Mock).mockReturnValue({ id: "trip1" });
  });

  test("should render loading state", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    });

    render(<BusSeatSelector />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("should render error state", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      error: "Failed to fetch trip data",
      data: null,
    });

    render(<BusSeatSelector />);
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  test("should render no data state", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: null,
    });

    render(<BusSeatSelector />);
    expect(screen.getByText("No trip data available.")).toBeInTheDocument();
  });

  test("should render seats correctly", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockTripData,
    });

    render(<BusSeatSelector />);

    expect(screen.getByText("Select Your Seats")).toBeInTheDocument();
    expect(screen.getByText("click a seat to choose")).toBeInTheDocument();

    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();

    for (let i = 1; i <= mockTripData.trip.totalSeats; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test("should allow selecting and deselecting available seats", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockTripData,
    });

    render(<BusSeatSelector />);

    fireEvent.click(screen.getByText("1"));
    expect(screen.getByTestId("selected-seats-text").textContent).toBe(
      "Selected seats: 1"
    );

    fireEvent.click(screen.getByText("2"));
    expect(screen.getByTestId("selected-seats-text").textContent).toBe(
      "Selected seats: 1, 2"
    );

    fireEvent.click(screen.getByText("1"));
    expect(screen.getByTestId("selected-seats-text").textContent).toBe(
      "Selected seats: 2"
    );
  });

  test("should not allow selecting unavailable seats", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockTripData,
    });

    render(<BusSeatSelector />);

    fireEvent.click(screen.getByText("3"));
    expect(screen.getByTestId("selected-seats-text").textContent).toBe(
      "Selected seats: "
    );
  });

  test("should clear selected seats when clicking clear button", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockTripData,
    });

    render(<BusSeatSelector />);

    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("2"));
    expect(screen.getByTestId("selected-seats-text").textContent).toBe(
      "Selected seats: 1, 2"
    );

    fireEvent.click(screen.getByTestId("clear-seats"));
    expect(screen.getByTestId("selected-seats-text").textContent).toBe(
      "Selected seats: "
    );
  });

  test("should correctly handle seat classes based on state", () => {
    (useGetTripDetailByIdQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockTripData,
    });

    render(<BusSeatSelector />);

    const unavailableSeat = screen.getByText("3").closest("button");
    expect(unavailableSeat).toHaveClass("bg-gray-300");
    expect(unavailableSeat).toBeDisabled();

    const availableSeat = screen.getByText("1").closest("button");
    expect(availableSeat).toHaveClass("bg-white");

    fireEvent.click(screen.getByText("1"));
    expect(availableSeat).toHaveClass("bg-green-500");
  });
});
