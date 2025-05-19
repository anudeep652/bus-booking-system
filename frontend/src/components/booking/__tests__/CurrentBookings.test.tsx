import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CurrentBookings } from "../CurrentBookings";
import { TBooking } from "../../../types";
import { calculateTimeDifference, formatDateShort } from "../../../utils";

jest.mock("lucide-react", () => ({
  Calendar: () => <div data-testid="icon-calendar" />,
  MapPin: () => <div data-testid="icon-mappin" />,
  Clock: () => <div data-testid="icon-clock" />,
  XCircle: () => <div data-testid="icon-xcircle" />,
  Info: () => <div data-testid="icon-info" />,
  CreditCard: () => <div data-testid="icon-creditcard" />,
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
  ChevronUp: () => <div data-testid="icon-chevron-up" />,
  CheckSquare: () => <div data-testid="icon-check-square" />,
  Square: () => <div data-testid="icon-square" />,
}));

jest.mock("../../../utils", () => ({
  calculateTimeDifference: jest.fn().mockReturnValue("2h 30m"),
  formatDateShort: jest.fn().mockReturnValue("Jan 1, 2023"),
}));

describe("CurrentBookings", () => {
  const mockOnCancelBooking = jest.fn().mockResolvedValue(undefined);
  const mockOnCancelSeat = jest.fn().mockResolvedValue(undefined);
  const mockOnCancelMultipleSeats = jest.fn().mockResolvedValue(undefined);

  const realDate = global.Date;
  const mockToday = new Date().toISOString();

  const mockBooking: TBooking = {
    _id: "booking123",
    booking_status: "confirmed",
    payment_status: "paid",
    seats: [
      { seat_number: 1, status: "booked" },
      { seat_number: 2, status: "booked" },
      { seat_number: 3, status: "booked" },
    ],
    trip_id: {
      source: "Mumbai",
      destination: "Delhi",
      departure_time: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
      arrival_time: "2023-01-04T12:30:00Z",
      price: 1500,
    },
    user_id: {
      name: "anudeep1",
      email: "anudeep1@gmail.com",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    global.Date = class extends Date {
      constructor(date: string | number | Date) {
        super(date);
        return date ? new realDate(date) : new realDate(mockToday);
      }
      static now() {
        return new realDate(mockToday).getTime();
      }
    } as any;
  });

  afterEach(() => {
    global.Date = realDate;
  });

  test("renders basic booking information correctly", () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    expect(screen.getByText(/Mumbai/i)).toBeInTheDocument();
    expect(screen.getByText(/Delhi/i)).toBeInTheDocument();
    expect(screen.getByText(/Rs.4500.00/i)).toBeInTheDocument();
    expect(screen.getByText(/3 Seats/i)).toBeInTheDocument();
    expect(screen.getByText(/Departing in 3 days/i)).toBeInTheDocument();
  });

  test("utility functions are called with correct parameters", () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    expect(calculateTimeDifference).toHaveBeenCalledWith(
      new Date(mockBooking.trip_id.departure_time),
      new Date(mockBooking.trip_id.arrival_time)
    );

    expect(formatDateShort).toHaveBeenCalledWith(
      mockBooking.trip_id.departure_time
    );
  });

  test("toggles seats management visibility when button is clicked", () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    expect(screen.queryByText(/Seat 1/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Manage Seats/i));

    expect(screen.getByText(/Seat 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Seat 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Seat 3/i)).toBeInTheDocument();

    expect(screen.getByText(/Select Multiple/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Manage Seats/i));

    expect(screen.queryByText(/Seat 1/i)).not.toBeInTheDocument();
  });

  test("cancels single seat when cancel button is clicked", async () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Manage Seats/i));

    const cancelButtons = screen.getAllByText(/Cancel/i);
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(mockOnCancelSeat).toHaveBeenCalledWith("booking123", 1);
    });
  });

  test("cancels entire booking with confirmation flow", async () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Cancel Entire Booking/i));

    expect(screen.getByText(/Confirm cancellation/i)).toBeInTheDocument();
    expect(
      screen.getByText(/This will cancel your entire booking/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Yes, Cancel Booking/i));

    await waitFor(() => {
      expect(mockOnCancelBooking).toHaveBeenCalledWith("booking123");
    });
  });

  test("handles selection mode for multiple seats", async () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Manage Seats/i));

    fireEvent.click(screen.getByText(/Select Multiple/i));

    expect(screen.getByText(/Exit Selection Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Select All/i)).toBeInTheDocument();

    const seatCards = screen.getAllByText(/Seat \d/i);
    fireEvent.click(seatCards[0]);
    fireEvent.click(seatCards[2]);

    expect(screen.getByText(/Cancel 2 Selected Seats/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cancel 2 Selected Seats/i));

    await waitFor(() => {
      expect(mockOnCancelMultipleSeats).toHaveBeenCalledWith(
        "booking123",
        [1, 3]
      );
    });
  });

  test("select all and clear selection buttons work correctly", () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Manage Seats/i));

    fireEvent.click(screen.getByText(/Select Multiple/i));

    fireEvent.click(screen.getByText(/Select All/i));

    expect(screen.getByText(/Cancel 3 Selected Seats/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Clear/i));

    expect(
      screen.queryByText(/Cancel 0 Selected Seats/i)
    ).not.toBeInTheDocument();
  });

  test("shows correct departure message based on days until departure", () => {
    const todayBooking = {
      ...mockBooking,
      trip_id: {
        ...mockBooking.trip_id,
        departure_time: new Date().toISOString(),
      },
    };

    const { rerender } = render(
      <CurrentBookings
        booking={todayBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    expect(screen.getByText(/Departing Today/i)).toBeInTheDocument();

    const tomorrowBooking = {
      ...mockBooking,
      trip_id: {
        ...mockBooking.trip_id,
        departure_time: new Date(
          Date.now() + 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    };

    rerender(
      <CurrentBookings
        booking={tomorrowBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    expect(screen.getByText(/Departing Tomorrow/i)).toBeInTheDocument();
  });

  test("renders icons correctly", () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    expect(screen.getByTestId("icon-calendar")).toBeInTheDocument();
    expect(screen.getAllByTestId("icon-mappin")).toHaveLength(2);
    expect(screen.getByTestId("icon-clock")).toBeInTheDocument();
    expect(screen.getByTestId("icon-creditcard")).toBeInTheDocument();
    expect(screen.getByTestId("icon-chevron-down")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Manage Seats/i));
    expect(screen.getByTestId("icon-chevron-up")).toBeInTheDocument();

    expect(screen.getAllByTestId("icon-xcircle").length).toBeGreaterThan(0);
  });

  test('displays "Seat" (singular) when only one seat is booked', () => {
    const singleSeatBooking = {
      ...mockBooking,
      seats: [{ seat_number: 1, status: "booked" as const }],
    };

    render(
      <CurrentBookings
        booking={singleSeatBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    expect(screen.getByText(/1 Seat/i)).toBeInTheDocument();
  });

  test("cancellation flow can be aborted", () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Cancel Entire Booking/i));

    expect(screen.getByText(/Confirm cancellation/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/No, Keep Booking/i));

    expect(screen.queryByText(/Confirm cancellation/i)).not.toBeInTheDocument();

    expect(screen.getByText(/Cancel Entire Booking/i)).toBeInTheDocument();

    expect(mockOnCancelBooking).not.toHaveBeenCalled();
  });
});
