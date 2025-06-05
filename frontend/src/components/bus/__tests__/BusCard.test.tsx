import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BusSearch from "../BusSearch";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("lucide-react", () => ({
  Search: (props: any) => <div data-testid="SearchIcon" {...props} />,
  MapPin: (props: any) => <div data-testid="MapPinIcon" {...props} />,
  Bus: (props: any) => <div data-testid="BusIcon" {...props} />,
  ArrowRight: (props: any) => <div data-testid="ArrowRightIcon" {...props} />,
  FilterX: (props: any) => <div data-testid="FilterXIcon" {...props} />,
  Star: (props: any) => <div data-testid="StarIcon" {...props} />,
}));

describe("BusSearch Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renders the main search form elements", () => {
    render(<BusSearch />);

    expect(
      screen.getByRole("heading", { name: /Find Your Perfect Bus Journey/i })
    ).toBeInTheDocument();
    const placeholderInputs = screen.getAllByPlaceholderText(
      "Enter city or station",
      { exact: false }
    );
    expect(placeholderInputs).toHaveLength(2);
    expect(screen.getAllByLabelText(/From/i)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText(/To/i)[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/Start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End date \(Optional\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Search Buses/i })
    ).toBeInTheDocument();
  });

  test("updates source and destination inputs on change", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const sourceInput = screen.getAllByPlaceholderText(
      "Enter city or station"
    )[0];
    const destinationInput = screen.getAllByPlaceholderText(
      "Enter city or station"
    )[1];

    await user.type(sourceInput, "New York");
    await user.type(destinationInput, "Boston");

    expect(sourceInput).toHaveValue("New York");
    expect(destinationInput).toHaveValue("Boston");
  });

  test("updates start and end date inputs on change", async () => {
    render(<BusSearch />);
    const startDateInput = screen.getByLabelText(/Start date/i);
    const endDateInput = screen.getByLabelText(/End date \(Optional\)/i);

    fireEvent.change(startDateInput, { target: { value: "2025-12-01T10:00" } });
    fireEvent.change(endDateInput, { target: { value: "2025-12-02T12:00" } });

    expect(startDateInput).toHaveValue("2025-12-01T10:00");
    expect(endDateInput).toHaveValue("2025-12-02T12:00");
  });

  test("updates price range inputs", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const minPriceInput = screen.getByPlaceholderText("Min");
    const maxPriceInput = screen.getByPlaceholderText("Max");

    await user.clear(minPriceInput);
    await user.type(minPriceInput, "100");
    await user.clear(maxPriceInput);
    await user.type(maxPriceInput, "1500");

    expect(minPriceInput).toHaveValue(100);
    expect(maxPriceInput).toHaveValue(1500);
  });

  test("updates minimum rating select", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);
    const ratingSelect = screen.getByLabelText(/Minimum Rating/i);

    await user.selectOptions(ratingSelect, "3");
    expect(ratingSelect).toHaveValue("3");
  });

  test("toggles bus type selection", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const acButton = screen.getByRole("button", { name: "AC" });
    const sleeperButton = screen.getByRole("button", { name: "Sleeper" });

    await user.click(acButton);
    expect(acButton).toHaveClass("bg-violet-600 text-white");

    await user.click(sleeperButton);
    expect(sleeperButton).toHaveClass("bg-violet-600 text-white");
    expect(acButton).toHaveClass("bg-violet-600 text-white");

    await user.click(acButton);
    expect(acButton).not.toHaveClass("bg-violet-600 text-white");
    expect(acButton).toHaveClass("bg-gray-100 text-gray-700");
  });

  test("fills source and destination when a popular route is clicked", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const popularRouteButton = screen.getByRole("button", {
      name: /CBE\s*Chennai/i,
    });
    await user.click(popularRouteButton);

    const sourceInput = screen.getAllByPlaceholderText(
      "Enter city or station"
    )[0];
    const destinationInput = screen.getAllByPlaceholderText(
      "Enter city or station"
    )[1];

    expect(sourceInput).toHaveValue("CBE");
    expect(destinationInput).toHaveValue("Chennai");
  });

  test("calls navigate with correct search params on form submission", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const sourceInput = screen.getAllByPlaceholderText(
      "Enter city or station"
    )[0];
    const destinationInput = screen.getAllByPlaceholderText(
      "Enter city or station"
    )[1];
    const startDateInput = screen.getByLabelText(/Start date/i);
    const minPriceInput = screen.getByPlaceholderText("Min");
    const acButton = screen.getByRole("button", { name: "AC" });
    const ratingSelect = screen.getByLabelText(/Minimum Rating/i);

    await user.type(sourceInput, "Mumbai");
    await user.type(destinationInput, "Delhi");
    fireEvent.change(startDateInput, { target: { value: "2025-10-10T09:00" } });
    await user.clear(minPriceInput);
    await user.type(minPriceInput, "500");
    await user.click(acButton);
    await user.selectOptions(ratingSelect, "4");

    const searchButton = screen.getByRole("button", { name: /Search Buses/i });
    await user.click(searchButton);

    const expectedParams = new URLSearchParams({
      source: "Mumbai",
      destination: "Delhi",
      startDate: "2025-10-10T09:00",
      minPrice: "500",
      ratings: "4",
      busType: "ac",
    }).toString();

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/bus/search?${expectedParams}`);
  });

  test("calls navigate with only changed search params on form submission", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const sourceInput = screen.getAllByPlaceholderText(
      "Enter city or station"
    )[0];
    await user.type(sourceInput, "CBE");

    const searchButton = screen.getByRole("button", { name: /Search Buses/i });
    await user.click(searchButton);

    const expectedParams = new URLSearchParams({
      source: "CBE",
    }).toString();

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/bus/search?${expectedParams}`);
  });

  test("handles empty form submission (only default values)", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const searchButton = screen.getByRole("button", { name: /Search Buses/i });
    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/bus/search?");
  });

  test("navigates with endDate and non-default maxPrice when other fields are default", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const endDateInput = screen.getByLabelText(/End date \(Optional\)/i);
    const maxPriceInput = screen.getByPlaceholderText("Max");

    const testEndDate = "2026-01-15T14:30";
    fireEvent.change(endDateInput, { target: { value: testEndDate } });

    const testMaxPrice = "4500";
    await user.clear(maxPriceInput);
    await user.type(maxPriceInput, testMaxPrice);

    const searchButton = screen.getByRole("button", { name: /Search Buses/i });
    await user.click(searchButton);

    const expectedParams = new URLSearchParams({
      endDate: testEndDate,
      maxPrice: testMaxPrice,
    }).toString();

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/bus/search?${expectedParams}`);
  });

  test("navigates with only endDate when price and other fields are default", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const endDateInput = screen.getByLabelText(/End date \(Optional\)/i);

    const testEndDate = "2027-02-20T10:00";
    fireEvent.change(endDateInput, { target: { value: testEndDate } });

    const searchButton = screen.getByRole("button", { name: /Search Buses/i });
    await user.click(searchButton);

    const expectedParams = new URLSearchParams({
      endDate: testEndDate,
    }).toString();

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/bus/search?${expectedParams}`);
  });

  test("navigates with only non-default maxPrice when date and other fields are default", async () => {
    const user = userEvent.setup();
    render(<BusSearch />);

    const maxPriceInput = screen.getByPlaceholderText("Max");

    const testMaxPrice = "3500";
    await user.clear(maxPriceInput);
    await user.type(maxPriceInput, testMaxPrice);

    const searchButton = screen.getByRole("button", { name: /Search Buses/i });
    await user.click(searchButton);

    const expectedParams = new URLSearchParams({
      maxPrice: testMaxPrice,
    }).toString();

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/bus/search?${expectedParams}`);
  });
});
