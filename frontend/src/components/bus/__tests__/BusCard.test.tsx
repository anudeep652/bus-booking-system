import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import BusCard from "../BusCard";
import { TBus } from "../../../types";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockDispatch = jest.fn();
jest.mock("../../../app/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("lucide-react", () => ({
  Calendar: (props: any) => <div data-testid="CalendarIcon" {...props} />,
  Clock: (props: any) => <div data-testid="ClockIcon" {...props} />,
  Users: (props: any) => <div data-testid="UsersIcon" {...props} />,
  Moon: (props: any) => <div data-testid="MoonIcon" {...props} />,
  Sun: (props: any) => <div data-testid="SunIcon" {...props} />,
}));

const mockFormatDate = jest.fn();
const mockGetJourneyTime = jest.fn();
jest.mock("../../../utils", () => ({
  formatDate: (dateString: string) => mockFormatDate(dateString),
  getJourneyTime: (startTime: string, endTime: string) =>
    mockGetJourneyTime(startTime, endTime),
}));

const mockSetBusActionCreator = jest.fn();
jest.mock("../../../features/bus/busSlice", () => ({
  setBus: (bus: TBus) => mockSetBusActionCreator(bus),
}));

const mockDate = (isoString: string) => {
  const originalDate = global.Date;

  class MockDate extends originalDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(isoString);
      } else {
        super(...(args as [any]));
      }
    }

    getHours() {
      const hours = new originalDate(this.valueOf()).getUTCHours();
      return hours;
    }

    getMinutes() {
      const minutes = new originalDate(this.valueOf()).getUTCMinutes();
      return minutes;
    }
  }

  global.Date = MockDate as any;
  return () => {
    global.Date = originalDate;
  };
};

describe("BusCard Component", () => {
  const sampleBusData: TBus = {
    id: "BUS001",
    busId: "89279739",
    busNumber: "TN 01 X 9999",
    busType: "Sleeper",
    departureTime: "2025-07-20T21:30:00.000Z",
    arrivalTime: "2025-07-21T07:15:00.000Z",
    source: "Chennai Central",
    destination: "Bangalore Majestic",
    price: 950,
    availableSeats: 22,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockFormatDate.mockImplementation(
      (dateString) =>
        `Formatted ${new Date(dateString).toISOString().split("T")[0]}`
    );
    mockGetJourneyTime.mockImplementation(
      (startTime, endTime) =>
        `Calculated Journey Time (${new Date(
          startTime
        ).getUTCHours()}-${new Date(endTime).getUTCHours()})`
    );
    mockSetBusActionCreator.mockImplementation((bus) => ({
      type: "features/bus/setBus_mocked",
      payload: bus,
    }));
  });

  test("renders all bus information correctly", () => {
    const restoreDateMock = mockDate("2025-07-20T00:00:00.000Z");

    render(<BusCard bus={sampleBusData} />);

    expect(screen.getByText(sampleBusData.busNumber)).toBeInTheDocument();
    expect(
      screen.getByText(sampleBusData.busType.toUpperCase())
    ).toBeInTheDocument();
    expect(screen.getByText(sampleBusData.source)).toBeInTheDocument();
    expect(screen.getByText(sampleBusData.destination)).toBeInTheDocument();
    expect(screen.getByText(`₹${sampleBusData.price}`)).toBeInTheDocument();
    expect(
      screen.getByText(`${sampleBusData.availableSeats} seats available`)
    ).toBeInTheDocument();

    expect(screen.getAllByText("21:30")[0]).toBeInTheDocument();
    expect(screen.getAllByText("7:15")[0]).toBeInTheDocument();

    expect(mockFormatDate).toHaveBeenCalledWith(sampleBusData.departureTime);
    expect(
      screen.getByText(
        `Formatted ${
          new Date(sampleBusData.departureTime).toISOString().split("T")[0]
        }`
      )
    ).toBeInTheDocument();

    expect(mockGetJourneyTime).toHaveBeenCalledWith(
      sampleBusData.departureTime,
      sampleBusData.arrivalTime
    );
    expect(
      screen.getByText(
        `Calculated Journey Time (${new Date(
          sampleBusData.departureTime
        ).getUTCHours()}-${new Date(sampleBusData.arrivalTime).getUTCHours()})`
      )
    ).toBeInTheDocument();

    expect(screen.getAllByTestId("ClockIcon").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("UsersIcon")).toBeInTheDocument();
    expect(screen.getByTestId("CalendarIcon")).toBeInTheDocument();

    restoreDateMock();
  });

  describe("BusTypeIcon rendering logic", () => {
    test('renders MoonIcon for "Sleeper" bus type (case-insensitive)', () => {
      render(<BusCard bus={{ ...sampleBusData, busType: "Sleeper" }} />);
      expect(screen.getByTestId("MoonIcon")).toBeInTheDocument();

      const { unmount } = render(
        <BusCard bus={{ ...sampleBusData, busType: "sleeper" }} />
      );
      expect(screen.getByTestId("MoonIcon")).toBeInTheDocument();
      unmount();
    });

    test('renders SunIcon for "AC" bus type (case-insensitive)', () => {
      render(<BusCard bus={{ ...sampleBusData, busType: "AC" }} />);
      expect(screen.getByTestId("SunIcon")).toBeInTheDocument();

      const { unmount } = render(
        <BusCard bus={{ ...sampleBusData, busType: "ac" }} />
      );
      expect(screen.getByTestId("SunIcon")).toBeInTheDocument();
      unmount();
    });

    test('renders SunIcon for other bus types (e.g., "Seater", default)', () => {
      render(<BusCard bus={{ ...sampleBusData, busType: "Seater" }} />);
      expect(screen.getByTestId("SunIcon")).toBeInTheDocument();
    });

    test("renders SunIcon if busType is an empty string (default case)", () => {
      render(<BusCard bus={{ ...sampleBusData, busType: "" }} />);
      expect(screen.getByTestId("SunIcon")).toBeInTheDocument();
    });
  });

  test("handleClick dispatches setBus action and navigates to the correct booking page", () => {
    render(<BusCard bus={sampleBusData} />);

    const selectSeatsButton = screen.getByRole("button", {
      name: /Select Seats/i,
    });
    fireEvent.click(selectSeatsButton);

    expect(mockSetBusActionCreator).toHaveBeenCalledTimes(1);
    expect(mockSetBusActionCreator).toHaveBeenCalledWith(sampleBusData);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "features/bus/setBus_mocked",
      payload: sampleBusData,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/book-bus/${sampleBusData.id}`);
  });

  test("handles different time formatting edge cases via getTime", () => {
    const edgeCaseBus: TBus = {
      ...sampleBusData,
      departureTime: "2025-01-01T08:05:00.000Z",
      arrivalTime: "2025-01-01T12:00:00.000Z",
    };

    const restoreDateMock = mockDate("2025-01-01T00:00:00.000Z");

    render(<BusCard bus={edgeCaseBus} />);
    expect(screen.getAllByText("8:05")[0]).toBeInTheDocument();
    expect(screen.getAllByText("12:00")[0]).toBeInTheDocument();

    restoreDateMock();
  });
});
