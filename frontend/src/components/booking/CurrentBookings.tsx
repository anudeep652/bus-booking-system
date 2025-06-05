import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  XCircle,
  Info,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
} from "lucide-react";
import { calculateTimeDifference, formatDateShort } from "../../utils";
import { TBooking } from "../../types";

const CurrentBookings: React.FC<{
  booking: TBooking;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onCancelSeat: (bookingId: string, seatNumber: number) => Promise<void>;
  onCancelMultipleSeats: (
    bookingId: string,
    seatNumbers: number[]
  ) => Promise<void>;
}> = ({ booking, onCancelBooking, onCancelSeat, onCancelMultipleSeats }) => {
  const [showSeats, setShowSeats] = useState(false);
  const [cancellingSeat, setCancellingSeat] = useState<number | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [cancellingMultiple, setCancellingMultiple] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const { trip_id: trip, seats } = booking;

  const departureDate = new Date(trip.departure_time);
  const arrivalDate = new Date(trip.arrival_time);

  const activeSeats = seats.filter((seat) => seat.status === "booked");

  const duration = calculateTimeDifference(departureDate, arrivalDate);

  const today = new Date();
  const daysUntilDeparture = Math.ceil(
    (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleCancelBooking = async () => {
    if (confirmCancel) {
      setCancellingBooking(true);
      try {
        await onCancelBooking(booking._id);
      } catch (error: unknown) {
        console.error("Failed to cancel booking:", error);
      } finally {
        setCancellingBooking(false);
        setConfirmCancel(false);
      }
    } else {
      setConfirmCancel(true);
    }
  };

  const handleCancelSeat = async (seatNumber: number) => {
    setCancellingSeat(seatNumber);
    try {
      await onCancelSeat(booking._id, seatNumber);
    } catch (error: unknown) {
      console.error(`Failed to cancel seat ${seatNumber}:`, error);
    } finally {
      setCancellingSeat(null);
    }
  };

  const toggleSeatSelection = (seatNumber: number) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((seat) => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleMultipleSeatsCancellation = async () => {
    if (selectedSeats.length > 0) {
      setCancellingMultiple(true);
      try {
        await onCancelMultipleSeats(booking._id, selectedSeats);
        setSelectedSeats([]);
        setSelectionMode(false);
      } catch (error: unknown) {
        console.error("Failed to cancel multiple seats:", error);
      } finally {
        setCancellingMultiple(false);
      }
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => !prev);
    if (selectionMode) {
      setSelectedSeats([]);
    }
  };

  const selectAllSeats = () => {
    const allSeatNumbers = activeSeats.map((seat) => seat.seat_number);
    setSelectedSeats(allSeatNumbers);
  };

  const clearSelection = () => {
    setSelectedSeats([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
      <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Calendar className="text-blue-600 w-5 h-5" />
          <div>
            <p className="font-medium text-blue-800">
              {daysUntilDeparture <= 0
                ? "Departing Today"
                : daysUntilDeparture === 1
                ? "Departing Tomorrow"
                : `Departing in ${daysUntilDeparture} days`}
            </p>
            <p className="text-sm text-blue-600">
              {formatDateShort(trip.departure_time)}
            </p>
          </div>
        </div>
        <div className="text-sm text-blue-800 font-semibold px-3 py-1 bg-blue-100 rounded-full">
          {activeSeats.length} {activeSeats.length === 1 ? "Seat" : "Seats"}
        </div>
      </div>

      <div className="p-4 grid gap-3">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div className="ml-2">
                <p className="text-sm text-gray-500">From</p>
                <p className="font-semibold">{trip.source}</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div className="ml-2">
                <p className="text-sm text-gray-500">To</p>
                <p className="font-semibold">{trip.destination}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">{duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <span className="font-medium">
              Rs.{(trip.price * activeSeats.length).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 grid gap-2">
        <button
          className="w-full text-left text-sm font-medium text-blue-700 flex justify-between items-center hover:bg-blue-50 p-2 rounded"
          onClick={() => setShowSeats(!showSeats)}
        >
          <span>Manage Seats</span>
          {showSeats ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showSeats && (
          <div className="bg-gray-50 p-3 rounded-md mt-1 mb-3">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-600">Selected Seats:</p>
              <div className="flex space-x-2">
                {activeSeats.length > 1 && (
                  <button
                    onClick={toggleSelectionMode}
                    className={`text-xs px-2 py-1 rounded ${
                      selectionMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {selectionMode ? "Exit Selection Mode" : "Select Multiple"}
                  </button>
                )}

                {selectionMode && (
                  <>
                    <button
                      onClick={selectAllSeats}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {activeSeats.map((seat) => (
                <div
                  key={seat.seat_number}
                  className={`${
                    selectedSeats.includes(seat.seat_number)
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-gray-200"
                  } border rounded p-2 text-center relative`}
                  onClick={() =>
                    selectionMode && toggleSeatSelection(seat.seat_number)
                  }
                >
                  {selectionMode && (
                    <div className="absolute top-1 left-1">
                      {selectedSeats.includes(seat.seat_number) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )}

                  <p className="font-semibold text-sm mb-1">
                    Seat {seat.seat_number}
                  </p>

                  {!selectionMode && (
                    <button
                      onClick={() => handleCancelSeat(seat.seat_number)}
                      disabled={cancellingSeat === seat.seat_number}
                      className="text-xs rounded bg-red-50 text-red-600 p-1 w-full hover:bg-red-100 disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>
                        {cancellingSeat === seat.seat_number
                          ? "Cancelling..."
                          : "Cancel"}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {selectionMode && selectedSeats.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={handleMultipleSeatsCancellation}
                  disabled={cancellingMultiple || selectedSeats.length === 0}
                  className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>
                    {cancellingMultiple
                      ? "Cancelling Seats..."
                      : `Cancel ${selectedSeats.length} Selected Seat${
                          selectedSeats.length === 1 ? "" : "s"
                        }`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeSeats.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-1">
            {confirmCancel ? (
              <div className="bg-red-50 p-3 rounded mb-3">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">
                      Confirm cancellation
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      This will cancel your entire booking. This action cannot
                      be undone.
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={handleCancelBooking}
                        disabled={cancellingBooking}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {cancellingBooking
                          ? "Cancelling..."
                          : "Yes, Cancel Booking"}
                      </button>
                      <button
                        onClick={() => setConfirmCancel(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                      >
                        No, Keep Booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCancelBooking}
                className="w-full py-2 px-4 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200 flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Entire Booking</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { CurrentBookings };
