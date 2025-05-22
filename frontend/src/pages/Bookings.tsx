import { Calendar } from "lucide-react";
import { CurrentBookings } from "../components/booking/CurrentBookings";
import {
  useCancelBookingMutation,
  useCancelSeatsMutation,
  useGetUserCurrentBookingsQuery,
} from "../features/booking/bookingApi";
import { TBooking } from "../types";
import toast from "react-hot-toast";

const Bookings = () => {
  const { data, isLoading } = useGetUserCurrentBookingsQuery({});
  const [cancelBooking, {}] = useCancelBookingMutation();
  const [cancelSeats, {}] = useCancelSeatsMutation();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium text-gray-700">
          Loading your bookings ...
        </div>
      </div>
    );
  }

  const onCancelBooking = async (bookingId: string) => {
    console.log("this is booking id: ", bookingId);
    await cancelBooking({ bookingId });
    toast.success("Successfully cancelled the booking");
  };
  const onCancelSeats = async (bookingId: string, seatNumbers: number[]) => {
    console.log("cancelling seats: ", seatNumbers);
    toast.success(
      "Successfully cancelled seat numbers: " + seatNumbers.join(",")
    );
    await cancelSeats({ bookingId, seatNumbers });
  };
  const bookings: TBooking[] = data?.data || [];
  const activeBookings = bookings.filter((booking) =>
    booking.seats.some((seat) => seat.status === "booked")
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Current Bookings</h1>
      <p className="text-gray-600 mb-6">Your upcoming scheduled trips</p>

      {activeBookings.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">
            No Upcoming Trips
          </h3>
          <p className="text-gray-500 mt-2">
            You don't have any scheduled trips at the moment.
          </p>
        </div>
      ) : (
        activeBookings.map((booking) => (
          <CurrentBookings
            key={booking._id}
            booking={booking}
            onCancelBooking={onCancelBooking}
            onCancelSeat={(b, seat) => onCancelSeats(b, [seat])}
            onCancelMultipleSeats={onCancelSeats}
          />
        ))
      )}
    </div>
  );
};

export default Bookings;
