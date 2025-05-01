export type TBus = {
  id: string;
  busNumber: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  source: string;
  destination: string;
};

export type TBusSearch = {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  minPrice: string;
  maxPrice: string;
};
export type TBusSearchResults = {
  success: boolean;
  data: TBus[];
};
