import { render, screen, fireEvent } from "@testing-library/react";
import { BookingHistoryCard } from "../BookingHistoryCard";
import { TBooking } from "../../../types";
import {
  calculateTimeDifference,
  getPaymentStatusDetails,
} from "../../../utils";

jest.mock("lucide-react", () => ({
  MapPin: () => <div data-testid="icon-mappin" />,
  Clock4: () => <div data-testid="icon-clock4" />,
  IndianRupee: () => <div data-testid="icon-rupee" />,
  UserRound: () => <div data-testid="icon-user" />,
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
  ChevronUp: () => <div data-testid="icon-chevron-up" />,
  CheckCircle2: () => <div data-testid="icon-check-circle" />,
  AlertCircle: () => <div data-testid="icon-alert-circle" />,
  Clock: () => <div data-testid="icon-clock" />,
}));

jest.mock("../../../utils", () => ({
  calculateTimeDifference: jest.fn().mockReturnValue("2h 30m"),
  getPaymentStatusDetails: jest.fn().mockReturnValue({
    color: "text-green-600",
    label: "successful",
  }),
}));

describe("BookingHistoryCard", () => {
  const mockBooking: TBooking = {
    booking_status: "confirmed",
    payment_status: "paid",
    seats: [
      { seat_number: 1, status: "booked" },
      { seat_number: 2, status: "booked" },
      { seat_number: 3, status: "cancelled" },
    ],
    trip_id: {
      source: "Mumbai",
      destination: "Delhi",
      departure_time: "2023-01-01T10:00:00Z",
      arrival_time: "2023-01-01T12:30:00Z",
      price: 1500,
    },
    _id: "73yuhw",
    user_id: {
      name: "anudeep1",
      email: "anudeep1@gmail.com",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders basic booking information correctly", () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    expect(screen.getByText(/Mumbai/i)).toBeInTheDocument();
    expect(screen.getByText(/Delhi/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    expect(screen.getByText(/Rs.1500.00/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Booked, 1 Cancelled/i)).toBeInTheDocument();
  });

  test("utility functions are called with correct parameters", () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    expect(calculateTimeDifference).toHaveBeenCalledWith(
      new Date(mockBooking.trip_id.departure_time),
      new Date(mockBooking.trip_id.arrival_time)
    );

    expect(getPaymentStatusDetails).toHaveBeenCalledWith(
      mockBooking.payment_status
    );
  });

  test("toggles seat details visibility when button is clicked", () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    expect(screen.queryByText(/Seat 1/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Seat Details/i));

    expect(screen.getByText(/Seat 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Seat 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Seat 1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Seat Details/i));

    expect(screen.queryByText(/Seat 1/i)).not.toBeInTheDocument();
  });

  test("displays correct status icons and colors", () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    const statusText = screen.getByText("Confirmed");
    expect(statusText).toHaveClass("text-green-600");

    fireEvent.click(screen.getByText(/Seat Details/i));

    const seatStatusBadges = screen.getAllByText(/booked|cancelled/);
    expect(seatStatusBadges).toHaveLength(3);
  });

  test("renders different status correctly for different booking statuses", () => {
    const cancelledBooking = {
      ...mockBooking,
      booking_status: "cancelled" as const,
    };

    const { rerender } = render(
      <BookingHistoryCard booking={cancelledBooking} />
    );
    expect(screen.getAllByText(/Cancelled/i).length).toBeGreaterThan(0);

    const partialBooking = {
      ...mockBooking,
      booking_status: "partially_cancelled" as const,
    };

    rerender(<BookingHistoryCard booking={partialBooking} />);
    expect(screen.getByText(/Partially Cancelled/i)).toBeInTheDocument();

    const unknownBooking = {
      ...mockBooking,
      booking_status: "something_else",
    };

    // @ts-ignore
    rerender(<BookingHistoryCard booking={unknownBooking} />);
    expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
  });

  test("correctly counts booked and cancelled seats", () => {
    const bookingWithMoreSeats = {
      ...mockBooking,
      seats: [
        { seat_number: 1, status: "booked" as const },
        { seat_number: 2, status: "booked" as const },
        { seat_number: 3, status: "booked" as const },
        { seat_number: 4, status: "cancelled" as const },
        { seat_number: 5, status: "cancelled" as const },
      ],
    };

    render(<BookingHistoryCard booking={bookingWithMoreSeats} />);
    expect(screen.getByText(/3 Booked, 2 Cancelled/i)).toBeInTheDocument();
  });

  test("renders icons correctly", () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    expect(screen.getAllByTestId("icon-mappin")).toHaveLength(2);
    expect(screen.getAllByTestId("icon-clock4")).toHaveLength(2);
    expect(screen.getByTestId("icon-rupee")).toBeInTheDocument();
    expect(screen.getByTestId("icon-user")).toBeInTheDocument();
    expect(screen.getByTestId("icon-chevron-down")).toBeInTheDocument();

    expect(screen.getByTestId("icon-check-circle")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Seat Details/i));
    expect(screen.getByTestId("icon-chevron-up")).toBeInTheDocument();
  });
});
