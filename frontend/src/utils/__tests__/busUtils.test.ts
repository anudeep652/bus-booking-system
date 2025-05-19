import {
  calculateTimeDifference,
  getPaymentStatusDetails,
  formatDateShort,
  formatDate,
  formatDateTime,
  getJourneyTime,
} from "../index";

describe("calculateTimeDifference", () => {
  beforeAll(() => {
    process.env.TZ = "Asia/Kolkata";
  });

  it("calculates hours and minutes difference when diff > 1 hour", () => {
    const start = new Date("2025-05-17T10:00:00Z");
    const end = new Date("2025-05-17T12:45:00Z");
    expect(calculateTimeDifference(start, end)).toBe("2 hr 45 min");
  });

  it("calculates only minutes when diff < 1 hour", () => {
    const start = new Date("2025-05-17T14:00:00Z");
    const end = new Date("2025-05-17T14:30:00Z");
    expect(calculateTimeDifference(start, end)).toBe("30 min");
  });

  it("returns 0 min when start and end are the same", () => {
    const date = new Date("2025-05-17T15:00:00Z");
    expect(calculateTimeDifference(date, date)).toBe("0 min");
  });
});

describe("getPaymentStatusDetails", () => {
  it("returns correct details for paid status", () => {
    expect(getPaymentStatusDetails("paid")).toEqual({
      color: "text-green-600",
      label: "Paid",
    });
  });

  it("returns correct details for failed status", () => {
    expect(getPaymentStatusDetails("failed")).toEqual({
      color: "text-red-600",
      label: "Payment Failed",
    });
  });

  it("returns correct details for pending status", () => {
    expect(getPaymentStatusDetails("pending")).toEqual({
      color: "text-yellow-600",
      label: "Pending",
    });
  });

  it("returns correct details for refunded status", () => {
    expect(getPaymentStatusDetails("refunded")).toEqual({
      color: "text-blue-600",
      label: "Refunded",
    });
  });

  it("returns correct details for partially_refunded status", () => {
    expect(getPaymentStatusDetails("partially_refunded")).toEqual({
      color: "text-orange-600",
      label: "Partially Refunded",
    });
  });

  it("returns Unknown for an unrecognized status", () => {
    expect(getPaymentStatusDetails("unknown_status")).toEqual({
      color: "text-gray-600",
      label: "Unknown",
    });
  });
});

describe("formatDateShort", () => {
  beforeAll(() => {
    process.env.TZ = "Asia/Kolkata";
  });

  it("formats date string into short US format with weekday in local time", () => {
    const input = "2025-05-17T15:30:00Z";
    expect(formatDateShort(input)).toBe("Sat, May 17, 9:00 PM");
  });

  it("handles single-digit hours correctly in local time", () => {
    const input = "2025-05-17T08:05:00Z";
    expect(formatDateShort(input)).toBe("Sat, May 17, 1:35 PM");
  });
});

describe("formatDate", () => {
  it('formats dateString to "Mon d, yyyy" format', () => {
    const input = "2025-05-17T00:00:00Z";
    expect(formatDate(input)).toBe("May 17, 2025");
  });

  it("handles different dates correctly", () => {
    const input = "2020-01-05T12:00:00Z";
    expect(formatDate(input)).toBe("Jan 5, 2020");
  });
});

describe("formatDateTime", () => {
  beforeAll(() => {
    process.env.TZ = "Asia/Kolkata";
  });

  it("formats dateTimeString including time in US format", () => {
    const input = "2025-05-17T15:30:00Z";
    const result = formatDateTime(input);
    expect(result).toMatch(/^May 17, 2025, \d{1,2}:\d{2} (AM|PM)$/);
  });

  it("handles midnight correctly", () => {
    const input = "2025-05-17T00:00:00Z";
    const result = formatDateTime(input);
    expect(result).toMatch(/^May 17, 2025, \d{1,2}:\d{2} (AM|PM)$/);
  });
});

describe("getJourneyTime", () => {
  beforeAll(() => {
    process.env.TZ = "Asia/Kolkata";
  });

  it("calculates hours and minutes for diff > 1h", () => {
    const dep = "2025-05-17T10:00:00Z";
    const arr = "2025-05-17T13:45:00Z";
    expect(getJourneyTime(dep, arr)).toBe("3h 45m");
  });

  it("calculates only minutes for diff < 1h", () => {
    const dep = "2025-05-17T10:00:00Z";
    const arr = "2025-05-17T10:30:00Z";
    expect(getJourneyTime(dep, arr)).toBe("30m");
  });

  it("rounds minutes correctly", () => {
    const dep = "2025-05-17T10:00:00Z";
    const arr = "2025-05-17T10:15:30Z";
    expect(getJourneyTime(dep, arr)).toBe("16m");
  });
});
