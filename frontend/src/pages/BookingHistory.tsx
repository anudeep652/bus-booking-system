import { Clock } from "lucide-react";
import { BookingHistoryCard } from "../components/booking/BookingHistoryCard";
import { useGetUserTripHistoryQuery } from "../features/booking/bookingApi";
import { TBooking } from "../types";

const BookingHistory = () => {
  const { data, isLoading } = useGetUserTripHistoryQuery({});
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium text-gray-700">
          Loading your booking history...
        </div>
      </div>
    );
  }
  const bookings: TBooking[] = data?.data || [];
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Completed Trip History</h1>
      {bookings.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <div className="mb-4">
            <Clock className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <p className="text-lg">No completed trips found</p>
          <p className="text-sm text-gray-500 mt-2">
            Your completed trip bookings will appear here
          </p>
        </div>
      ) : (
        bookings.map((booking) => (
          <BookingHistoryCard key={booking._id} booking={booking} />
        ))
      )}
    </div>
  );
};

export default BookingHistory;
