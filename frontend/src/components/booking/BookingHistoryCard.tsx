import {
  MapPin,
  Clock4,
  IndianRupee,
  UserRound,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { TBooking } from "../../types";
import { useState } from "react";
import { calculateTimeDifference, getPaymentStatusDetails } from "../../utils";

const getStatusDetails = (status: string) => {
  switch (status) {
    case "confirmed":
      return {
        color: "text-green-600",
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        label: "Confirmed",
      };
    case "cancelled":
      return {
        color: "text-red-600",
        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        label: "Cancelled",
      };
    case "partially_cancelled":
      return {
        color: "text-yellow-600",
        icon: <Clock className="w-5 h-5 text-yellow-600" />,
        label: "Partially Cancelled",
      };
    default:
      return {
        color: "text-gray-600",
        icon: <Clock className="w-5 h-5 text-gray-600" />,
        label: "Unknown",
      };
  }
};

const SeatStatusBadge: React.FC<{ status: "booked" | "cancelled" }> = ({
  status,
}) => {
  const statusStyles = {
    booked: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <AlertCircle className="w-4 h-4 text-red-600" />,
    },
  };

  const { bg, text, icon } = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}
    >
      {icon}
      <span className="ml-1 capitalize">{status}</span>
    </span>
  );
};

export const BookingHistoryCard: React.FC<{ booking: TBooking }> = ({
  booking,
}) => {
  const [showSeats, setShowSeats] = useState(false);
  const { trip_id: trip, seats } = booking;
  const statusDetails = getStatusDetails(booking.booking_status);
  const paymentStatusDetails = getPaymentStatusDetails(booking.payment_status);

  const departureDate = new Date(trip.departure_time);
  const arrivalDate = new Date(trip.arrival_time);

  const timeDifference = calculateTimeDifference(departureDate, arrivalDate);

  const bookedSeats = seats.filter((seat) => seat.status === "booked").length;
  const cancelledSeats = seats.filter(
    (seat) => seat.status === "cancelled"
  ).length;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          {statusDetails.icon}
          <span className={`font-semibold ${statusDetails.color}`}>
            {statusDetails.label}
          </span>
        </div>
        <div className={`font-medium ${paymentStatusDetails.color}`}>
          payment {paymentStatusDetails.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span>
            <strong>From:</strong> {trip.source}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span>
            <strong>To:</strong> {trip.destination}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <Clock4 className="w-5 h-5 text-gray-500" />
          <span>
            <strong>Departure:</strong> {departureDate.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock4 className="w-5 h-5 text-gray-500" />
          <span>
            <strong>Duration:</strong> {timeDifference}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <IndianRupee className="w-5 h-5 text-gray-500" />
          <span>
            <strong>Price:</strong> Rs.{trip.price.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <UserRound className="w-5 h-5 text-gray-500" />
          <span>
            <strong>Seats:</strong> {bookedSeats} Booked, {cancelledSeats}{" "}
            Cancelled
          </span>
        </div>
      </div>

      <div className="border-t pt-3">
        <button
          className="w-full flex justify-between items-center hover:bg-gray-50 p-2 rounded"
          onClick={() => setShowSeats(!showSeats)}
        >
          <span className="font-medium">Seat Details</span>
          {showSeats ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {showSeats && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {seats.map((seat) => (
              <div
                key={seat.seat_number}
                className="flex flex-col items-center p-2 border rounded"
              >
                <span className="font-semibold mb-1">
                  Seat {seat.seat_number}
                </span>
                <SeatStatusBadge status={seat.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
