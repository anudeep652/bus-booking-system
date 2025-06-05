export type TBookingData = { trip_id: string; seat_numbers: number[] };

export type TSeat = {
  _id: string;
  seat_number: number;
  status: "booked" | "cancelled";
};
export type TBookingStatus = "confirmed" | "cancelled" | "partially_cancelled";

export type TPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type TTrip = {
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
};

export type TBooking = {
  _id: string;
  trip_id: TTrip;
  user_id: {
    name: string;
    email: string;
  };
  seats: TSeat[];
  payment_status: TPaymentStatus;
  booking_status: TBookingStatus;
};

export type TBookingResponse = {
  success: boolean;
  data: {
    _id: string;
    user_id: {
      _id: string;
      name: string;
      email: string;
    };
    trip_id: {
      _id: string;
      bus_id: string;
      source: string;
      destination: string;
      departure_time: string;
      price: number;
    };
    seats: TSeat[];
    payment_status: TPaymentStatus;
    booking_status: TBookingStatus;
  };
};

export type TTicketData = TBookingResponse["data"];

export type TCancelBookingResponse = {
  success: boolean;
  data: {
    _id: string;
    user_id: string;
    trip_id: string;
    seats: TSeat[];
    payment_status: TPaymentStatus;
    booking_status: TBookingStatus;
  };
};

export type TTripByIdResponse = {
  data: {
    totalSeats: number;
    seatsPerRow: number;
    pricePerSeat: string;
    unavailableSeats: number[];
  };
};

export type TCancelSeatsdata = {
  bookingId: string;
  seatNumbers: number[];
};
