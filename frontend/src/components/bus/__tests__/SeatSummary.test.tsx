import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SeatSummary } from "../SeatSummary";
import { useNavigate } from "react-router-dom";
import { useBookBusMutation } from "../../../features/booking/bookingApi";
import { generateTicketPDF } from "../../booking/GenerateBookingTicket";
import toast from "react-hot-toast";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../../features/booking/bookingApi", () => ({
  useBookBusMutation: jest.fn(),
}));

jest.mock("../../booking/GenerateBookingTicket", () => ({
  generateTicketPDF: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

describe("SeatSummary Component", () => {
  const mockClearSelectedSeats = jest.fn();
  const mockNavigate = jest.fn();
  const mockBookBus = jest.fn();
  const mockUnwrap = jest.fn();

  const mockBusDetails = {
    id: "trip123",
    busId: "TN",
    busNumber: "BUS-001",
    busType: "sleeper",
    source: "New York",
    destination: "Boston",
    departureTime: "2025-05-20T10:00:00Z",
    arrivalTime: "2025-05-20T14:00:00Z",
    availableSeats: 32,
    price: 1200,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    mockUnwrap.mockReturnValue(
      Promise.resolve({ data: { ticketDetails: "test" } })
    );
    mockBookBus.mockReturnValue({ unwrap: mockUnwrap });
    (useBookBusMutation as jest.Mock).mockReturnValue([
      mockBookBus,
      { isLoading: false, isSuccess: false },
    ]);
  });

  test("should render no bus selected message when busDetails is null", () => {
    render(
      <SeatSummary
        selectedSeats={[]}
        busDetails={null}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    expect(screen.getByText("No Bus Selected")).toBeInTheDocument();
    expect(
      screen.getByText("Please select a bus to view details.")
    ).toBeInTheDocument();
  });

  test("should render bus details correctly", () => {
    render(
      <SeatSummary
        selectedSeats={[]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    expect(screen.getByText("Bus Details")).toBeInTheDocument();
    expect(screen.getByText("Bus Number:")).toBeInTheDocument();
    expect(screen.getByText(mockBusDetails.busNumber)).toBeInTheDocument();
    expect(screen.getByText("Bus Type:")).toBeInTheDocument();
    expect(screen.getByText(/sleeper/i)).toBeInTheDocument();
    expect(screen.getByText("Route:")).toBeInTheDocument();
    expect(
      screen.getByText(
        `${mockBusDetails.source} to ${mockBusDetails.destination}`
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Available Seats:")).toBeInTheDocument();
    expect(
      screen.getByText(mockBusDetails.availableSeats.toString())
    ).toBeInTheDocument();
  });

  test("should display 'None' when no seats are selected", () => {
    render(
      <SeatSummary
        selectedSeats={[]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    expect(screen.getByText("Selected Seats:")).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
    expect(screen.getByText("Number of Seats:")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Total Amount:")).toBeInTheDocument();
    expect(screen.getByText("₹0")).toBeInTheDocument();
  });

  test("should display selected seats in sorted order", () => {
    const selectedSeats = [5, 2, 8];
    render(
      <SeatSummary
        selectedSeats={selectedSeats}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    expect(screen.getByText("Selected Seats:")).toBeInTheDocument();
    expect(screen.getByText("2, 5, 8")).toBeInTheDocument();
    expect(screen.getByText("Number of Seats:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    const totalPrice = selectedSeats.length * mockBusDetails.price;
    expect(
      screen.getByText(`₹${totalPrice.toLocaleString()}`)
    ).toBeInTheDocument();
  });

  test("should disable checkout button when no seats are selected", () => {
    const { container } = render(
      <SeatSummary
        selectedSeats={[]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    const button = container.querySelector('button[class*="bg-gray-300"]');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");

    const buttonText = button ? button.textContent : "";
    expect(buttonText).toMatch(/proceed to checkout/i);
  });

  test("should enable checkout button when seats are selected", () => {
    const { container } = render(
      <SeatSummary
        selectedSeats={[1, 2]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    const button = container.querySelector('button[class*="bg-indigo-600"]');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveClass("cursor-not-allowed");

    const buttonText = button ? button.textContent : "";
    expect(buttonText).toMatch(/proceed to checkout/i);
  });

  test("should show loading state when booking is in progress", () => {
    (useBookBusMutation as jest.Mock).mockReturnValue([
      mockBookBus,
      { isLoading: true, isSuccess: false },
    ]);

    const { container } = render(
      <SeatSummary
        selectedSeats={[1, 2]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    const button =
      container.querySelector("button[disabled]") ||
      container.querySelector('button[class*="bg-indigo-600"]');

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("w-full");
  });

  test("should call bookBus with correct parameters when proceeding to checkout", async () => {
    const mockDate = new Date("2025-05-17");
    const originalDate = global.Date;
    global.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
      toLocaleDateString() {
        return "5/17/2025";
      }
    } as DateConstructor;

    const { container } = render(
      <SeatSummary
        selectedSeats={[1, 2]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    const button = container.querySelector('button[class*="bg-indigo-600"]');
    // @ts-ignore
    fireEvent.click(button);

    expect(mockBookBus).toHaveBeenCalledWith({
      trip_id: mockBusDetails.id,
      seat_numbers: [1, 2],
      timestamp: "5/17/2025",
    });

    global.Date = originalDate;
  });

  test("should generate ticket PDF and navigate to success page on successful booking", async () => {
    jest.useFakeTimers();

    const { container } = render(
      <SeatSummary
        selectedSeats={[1, 2]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    const button = container.querySelector('button[class*="bg-indigo-600"]');
    // @ts-ignore
    fireEvent.click(button);

    await waitFor(() => {
      expect(generateTicketPDF).toHaveBeenCalledWith({ ticketDetails: "test" });
    });

    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/success", {
        state: { success: true },
      });
    });

    expect(mockClearSelectedSeats).toHaveBeenCalled();

    jest.useRealTimers();
  });

  test("should show error toast and clear seats on booking failure", async () => {
    mockUnwrap.mockReturnValue(
      Promise.reject({ data: { message: "Booking failed" } })
    );

    const { container } = render(
      <SeatSummary
        selectedSeats={[1, 2]}
        busDetails={mockBusDetails}
        clearSelectedSeats={mockClearSelectedSeats}
      />
    );

    const button = container.querySelector('button[class*="bg-indigo-600"]');
    // @ts-ignore
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Booking failed");
    });

    expect(mockClearSelectedSeats).toHaveBeenCalled();
  });
});
