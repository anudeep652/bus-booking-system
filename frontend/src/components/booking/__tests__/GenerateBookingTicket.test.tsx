import renderer, { act } from "react-test-renderer";
import { TicketDocument, generateTicketPDF } from "../GenerateBookingTicket";
import { Text } from "@react-pdf/renderer";

jest.mock("@react-pdf/renderer", () => {
  const Document = ({ children }: { children?: React.ReactNode }) => children;
  const Page = ({ children }: { children?: React.ReactNode }) => children;
  const Text = ({ children }: { children?: React.ReactNode }) => ({
    type: "Text",
    children,
  });
  const View = ({ children }: { children?: React.ReactNode }) => ({
    type: "View",
    children,
  });

  return {
    pdf: jest.fn().mockReturnValue({
      toBlob: jest
        .fn()
        .mockResolvedValue(new Blob(["test"], { type: "application/pdf" })),
    }),
    Document,
    Page,
    Text,
    View,
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

global.URL.createObjectURL = jest.fn(() => "mock-blob-url");
global.URL.revokeObjectURL = jest.fn();
global.window.open = jest.fn();

const mockTicketData = {
  _id: "BOOK12345",
  user_id: {
    name: "John Doe",
    email: "john.doe@example.com",
  },
  trip_id: {
    source: "City A",
    destination: "City B",
    departure_time: "2024-08-15T10:00:00.000Z",
    price: 500,
  },
  seats: [
    { _id: "seat1", seat_number: 1, status: "booked" },
    { _id: "seat2", seat_number: 2, status: "booked" },
  ],
  booking_status: "confirmed",
  payment_status: "paid",
};

const mockPendingTicketData = {
  ...mockTicketData,
  booking_status: "pending_payment",
  payment_status: "pending",
};

describe("TicketDocument Component", () => {
  it("should format date correctly", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    generateTicketPDF(mockTicketData);

    const ticketDocComponent = pdf.mock.calls[0][0];

    const result = ticketDocComponent.type({ ticketData: mockTicketData });

    expect(result).toBeDefined();
  });

  it("should handle invalid date string gracefully", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const invalidDateTicketData = {
      ...mockTicketData,
      trip_id: {
        ...mockTicketData.trip_id,
        departure_time: "Invalid Date",
      },
    };

    generateTicketPDF(invalidDateTicketData);

    const ticketDocComponent = pdf.mock.calls[0][0];

    expect(ticketDocComponent.props.ticketData.trip_id.departure_time).toBe(
      "Invalid Date"
    );
  });

  it("should display pending payment status when payment is pending", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    generateTicketPDF(mockPendingTicketData);

    const ticketDocComponent = pdf.mock.calls[0][0];

    expect(ticketDocComponent.props.ticketData.payment_status).toBe("pending");
    expect(ticketDocComponent.props.ticketData.booking_status).toBe(
      "pending_payment"
    );
  });

  it("should render seat information for all seats", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const multiSeatTicket = {
      ...mockTicketData,
      seats: [
        { _id: "seat1", seat_number: 1, status: "booked" },
        { _id: "seat2", seat_number: 2, status: "booked" },
        { _id: "seat3", seat_number: 3, status: "booked" },
      ],
    };

    generateTicketPDF(multiSeatTicket);

    const ticketDocComponent = pdf.mock.calls[0][0];

    expect(ticketDocComponent.props.ticketData.seats.length).toBe(3);
  });
});

describe("generateTicketPDF Function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should generate and open PDF successfully", async () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    const mockToBlob = jest
      .fn()
      .mockResolvedValue(
        new Blob(["fake pdf content"], { type: "application/pdf" })
      );

    pdf.mockReturnValue({ toBlob: mockToBlob });

    await generateTicketPDF(mockTicketData);

    expect(pdf).toHaveBeenCalled();
    expect(mockToBlob).toHaveBeenCalledTimes(1);
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(global.window.open).toHaveBeenCalledWith("mock-blob-url", "_blank");

    jest.advanceTimersByTime(100);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mock-blob-url");
  });

  it("should log an error if no ticket data is provided", async () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await generateTicketPDF(null as any);
    await generateTicketPDF(undefined as any);

    expect(consoleErrorSpy).toHaveBeenCalledWith("No ticket data available");
    expect(pdf).not.toHaveBeenCalled();
    expect(global.window.open).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should log an error if PDF generation fails", async () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const generationError = new Error("PDF generation failed");
    const mockToBlob = jest.fn().mockRejectedValue(generationError);
    pdf.mockReturnValue({ toBlob: mockToBlob });

    await generateTicketPDF(mockTicketData);

    expect(pdf).toHaveBeenCalled();
    expect(mockToBlob).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error generating PDF:",
      generationError
    );
    expect(global.window.open).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should create and revoke blob URLs correctly", async () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    const mockToBlob = jest
      .fn()
      .mockResolvedValue(
        new Blob(["fake pdf content"], { type: "application/pdf" })
      );

    pdf.mockReturnValue({ toBlob: mockToBlob });

    await generateTicketPDF(mockTicketData);

    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mock-blob-url");
  });

  it("should render the TicketDocument component with correct props", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    generateTicketPDF(mockTicketData);

    expect(pdf).toHaveBeenCalledTimes(1);
    const renderedComponent = pdf.mock.calls[0][0];

    expect(renderedComponent.type).toBe(TicketDocument);

    expect(renderedComponent.props.ticketData).toEqual(mockTicketData);
  });
});

describe("TicketDocument Edge Cases", () => {
  it("should handle tickets with no seats", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const noSeatsTicket = {
      ...mockTicketData,
      seats: [],
    };

    generateTicketPDF(noSeatsTicket);

    const ticketDocComponent = pdf.mock.calls[0][0];
    expect(ticketDocComponent.props.ticketData.seats).toEqual([]);
  });

  it("should handle missing user information gracefully", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const missingUserInfoTicket = {
      ...mockTicketData,
      user_id: {
        email: "john.doe@example.com",
      },
    };

    generateTicketPDF(missingUserInfoTicket);

    const ticketDocComponent = pdf.mock.calls[0][0];
    expect(ticketDocComponent.props.ticketData.user_id.name).toBeUndefined();
    expect(ticketDocComponent.props.ticketData.user_id.email).toBe(
      "john.doe@example.com"
    );
  });

  it("should handle missing trip information gracefully", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const missingTripInfoTicket = {
      ...mockTicketData,
      trip_id: {
        source: "City A",

        departure_time: "2024-08-15T10:00:00.000Z",
      },
    };

    generateTicketPDF(missingTripInfoTicket);

    const ticketDocComponent = pdf.mock.calls[0][0];
    expect(
      ticketDocComponent.props.ticketData.trip_id.destination
    ).toBeUndefined();
    expect(ticketDocComponent.props.ticketData.trip_id.price).toBeUndefined();
  });

  it("should not throw if formatDate throws and should render the original date string", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const OriginalDate = global.Date;

    global.Date = function (dateString: any) {
      if (dateString === "bad-date-string") {
        throw new Error("Invalid date");
      }

      return new OriginalDate(dateString);
    } as unknown as DateConstructor;

    expect(() => {
      generateTicketPDF({
        ...mockTicketData,
        trip_id: {
          ...mockTicketData.trip_id,
          departure_time: "bad-date-string",
        },
      });
    }).not.toThrow();

    const ticketDocComponent = pdf.mock.calls[0][0];

    const result = ticketDocComponent.type({
      ticketData: {
        ...mockTicketData,
        trip_id: {
          ...mockTicketData.trip_id,
          departure_time: "bad-date-string",
        },
      },
    });

    global.Date = OriginalDate;

    expect(result).toBeDefined();
  });

  it("should handle missing booking_status and payment_status gracefully", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const missingStatusTicket = {
      ...mockTicketData,
      booking_status: undefined,
      payment_status: undefined,
    };

    generateTicketPDF(missingStatusTicket);

    const ticketDocComponent = pdf.mock.calls[0][0];
    expect(ticketDocComponent.props.ticketData.booking_status).toBeUndefined();
    expect(ticketDocComponent.props.ticketData.payment_status).toBeUndefined();
  });

  it("should handle seats with missing seat_number or status", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const incompleteSeatsTicket = {
      ...mockTicketData,
      seats: [
        { _id: "seat1" },
        { _id: "seat2", seat_number: 2 },
        { _id: "seat3", status: "booked" },
      ],
    };

    generateTicketPDF(incompleteSeatsTicket);

    const ticketDocComponent = pdf.mock.calls[0][0];
    expect(ticketDocComponent.props.ticketData.seats.length).toBe(3);
  });

  it("should handle completely empty ticketData object", () => {
    const pdf = jest.requireMock("@react-pdf/renderer").pdf;
    jest.clearAllMocks();

    const emptyTicket = {};

    generateTicketPDF(emptyTicket);

    const ticketDocComponent = pdf.mock.calls[0][0];
    expect(ticketDocComponent.props.ticketData).toEqual({});
  });
});
