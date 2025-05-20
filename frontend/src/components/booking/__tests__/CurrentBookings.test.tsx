import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CurrentBookings } from "../CurrentBookings";
import { TBooking } from "../../../types";
import { calculateTimeDifference, formatDateShort } from "../../../utils";
import React from "react";

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

  test("handles error when cancelling a booking", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const failingCancelBooking = jest
      .fn()
      .mockRejectedValue(new Error("Failed to cancel booking"));

    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={failingCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Cancel Entire Booking/i));
    fireEvent.click(screen.getByText(/Yes, Cancel Booking/i));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to cancel booking:",
        expect.any(Error)
      );
    });

    console.error = originalConsoleError;
  });

  test("handles error when cancelling a seat", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const failingCancelSeat = jest
      .fn()
      .mockRejectedValue(new Error("Failed to cancel seat"));

    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={failingCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Manage Seats/i));

    const cancelButtons = screen.getAllByText(/Cancel/i);
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to cancel seat 1:",
        expect.any(Error)
      );
    });

    console.error = originalConsoleError;
  });

  test("toggles seat selection when seat is clicked in selection mode", async () => {
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

    const seatCards = screen.getAllByText(/Seat \d/i);
    fireEvent.click(seatCards[0]);

    fireEvent.click(seatCards[0]);

    expect(
      screen.queryByText(/Cancel 1 Selected Seat/i)
    ).not.toBeInTheDocument();
  });

  test("does nothing when trying to cancel multiple seats with none selected", async () => {
    const originalAddEventListener = document.addEventListener;
    let capturedClickHandler: Function | null = null;

    document.addEventListener = jest.fn((event, handler) => {
      if (event === "click") {
        capturedClickHandler = handler as Function;
      }
      return originalAddEventListener(event, handler);
    });

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

    const fakeButton = document.createElement("button");
    fakeButton.dataset.testid = "fake-cancel-button";
    fakeButton.textContent = "Cancel 0 Selected Seats";
    document.body.appendChild(fakeButton);

    fireEvent.click(fakeButton);

    expect(mockOnCancelMultipleSeats).not.toHaveBeenCalled();

    document.body.removeChild(fakeButton);
    document.addEventListener = originalAddEventListener;
  });

  test("does nothing when trying to cancel multiple seats with none selected", async () => {
    const consoleSpy = jest.spyOn(console, "error");

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

    const seatCards = screen.getAllByText(/Seat \d/i);
    fireEvent.click(seatCards[0]);

    const cancelButton = screen.getByText(/Cancel 1 Selected Seat/i);

    fireEvent.click(screen.getByText(/Clear/i));

    fireEvent.click(cancelButton, { force: true });

    expect(mockOnCancelMultipleSeats).not.toHaveBeenCalled();

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
  test("handleMultipleSeatsCancellation should return early when no seats are selected", async () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    const manageSeatsButton = screen.getByText("Manage Seats");
    fireEvent.click(manageSeatsButton);

    const selectMultipleButton = screen.getByText("Select Multiple");
    fireEvent.click(selectMultipleButton);

    expect(screen.getByText("Exit Selection Mode")).toBeInTheDocument();

    const originalConsoleError = console.error;
    console.error = jest.fn();

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel 0 Selected Seats";
    cancelButton.setAttribute("data-testid", "mock-cancel-button");
    document.body.appendChild(cancelButton);

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnCancelMultipleSeats).not.toHaveBeenCalled();
    });

    document.body.removeChild(cancelButton);
    console.error = originalConsoleError;
  });
  test("cancel button should not appear when no seats are selected", async () => {
    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={mockOnCancelMultipleSeats}
      />
    );

    const manageSeatsButton = screen.getByText("Manage Seats");
    fireEvent.click(manageSeatsButton);

    const selectMultipleButton = screen.getByText("Select Multiple");
    fireEvent.click(selectMultipleButton);

    const cancelButtonText = /Cancel 0 Selected Seat/i;
    expect(screen.queryByText(cancelButtonText)).not.toBeInTheDocument();
  });

  test("clears selected seats when exiting selection mode", () => {
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

    const seatCards = screen.getAllByText(/Seat \d/i);
    fireEvent.click(seatCards[0]);
    fireEvent.click(seatCards[1]);

    expect(screen.getByText(/Cancel 2 Selected Seats/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Exit Selection Mode/i));

    fireEvent.click(screen.getByText(/Select Multiple/i));

    expect(
      screen.queryByText(/Cancel \d+ Selected Seat/i)
    ).not.toBeInTheDocument();
  });

  test("handles error when cancelling multiple seats", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const failingCancelMultipleSeats = jest
      .fn()
      .mockRejectedValue(new Error("Failed to cancel multiple seats"));

    render(
      <CurrentBookings
        booking={mockBooking}
        onCancelBooking={mockOnCancelBooking}
        onCancelSeat={mockOnCancelSeat}
        onCancelMultipleSeats={failingCancelMultipleSeats}
      />
    );

    fireEvent.click(screen.getByText(/Manage Seats/i));

    fireEvent.click(screen.getByText(/Select Multiple/i));

    const seatCards = screen.getAllByText(/Seat \d/i);
    fireEvent.click(seatCards[0]);

    fireEvent.click(screen.getByText(/Cancel 1 Selected Seat/i));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to cancel multiple seats:",
        expect.any(Error)
      );
    });

    console.error = originalConsoleError;
  });

  test("verifies the clear selection functionality", () => {
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

    const seatCards = screen.getAllByText(/Seat \d/i);
    fireEvent.click(seatCards[0]);
    fireEvent.click(seatCards[1]);

    expect(screen.getByText(/Cancel 2 Selected Seats/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Clear/i));

    expect(
      screen.queryByText(/Cancel \d+ Selected Seat/i)
    ).not.toBeInTheDocument();
  });

  test("does nothing when trying to cancel with no seats selected", () => {
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

    expect(
      screen.queryByText(/Cancel \d+ Selected Seat/i)
    ).not.toBeInTheDocument();

    expect(mockOnCancelMultipleSeats).not.toHaveBeenCalled();
  });
});
