export type TBookingData = { trip_id: string; seat_numbers: number[] };

export type TSeat = {
  seat_number: number;
  status: "booked" | "cancelled";
};

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
  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";
  booking_status: "confirmed" | "cancelled" | "partially_cancelled";
};
