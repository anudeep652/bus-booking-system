export type TBus = {
  id: string;
  busId: string;
  busNumber: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  source: string;
  destination: string;
};

export type TBusType = ("sleeper" | "seater") | ("ac" | "nonAc");

export type TBusSearch = {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  priceRange: [number, number];
  ratings: number;
  busType: TBusType[];
};

export type TBusSearchParams = Omit<
  TBusSearch,
  "priceRange" | "ratings" | "busType"
> & {
  minPrice: string;
  maxPrice: string;
  ratings: string;
  busType: string;
};

export type TBusSearchResults = {
  success: boolean;
  data: TBus[];
};

export type TbusSeatSummary = {
  selectedSeats: number[];
  busDetails: TBus | null;
};
