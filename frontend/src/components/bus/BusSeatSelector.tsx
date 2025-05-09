import { useState } from "react";
import { SeatSummary } from "./SeatSummary";
import { useAppSelector } from "../../app/hooks";
import { selectBus } from "../../features/bus/busSlice";
import { useParams } from "react-router-dom";
import { useGetTripDetailByIdQuery } from "../../features/booking/bookingApi";

export default function BusSeatSelector() {
  const bus = useAppSelector(selectBus);
  const params = useParams();
  console.log(params.id);
  const { data, isError, isLoading, error } = useGetTripDetailByIdQuery(
    params.id
  );

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {JSON.stringify(error)}</div>;
  if (!data) return <div>No trip data available.</div>;

  const totalRows = Math.ceil(data.trip.totalSeats / data.trip.seatsPerRow);

  const isSeatSelected = (seatNumber: number) => {
    return selectedSeats.includes(seatNumber);
  };

  const isSeatUnavailable = (seatNumber: number) => {
    return data.trip.unavailableSeats.includes(seatNumber);
  };

  const handleSeatClick = (seatNumber: number) => {
    if (isSeatUnavailable(seatNumber)) return;

    if (isSeatSelected(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const renderSeats = () => {
    const seats = [];

    for (let row = 0; row < totalRows; row++) {
      const rowSeats = [];

      for (let seatIndex = 0; seatIndex < data.trip.seatsPerRow; seatIndex++) {
        const seatNumber = row * data.trip.seatsPerRow + seatIndex + 1;

        if (seatNumber > data.trip.totalSeats) continue;

        const isAisle = seatIndex === 1 || seatIndex === 2;

        rowSeats.push(
          <div
            key={`seat-${seatNumber}`}
            className={`relative ${isAisle ? "mr-4" : "mr-2"}`}
          >
            <button
              className={`w-12 h-12 rounded-t-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                isSeatUnavailable(seatNumber)
                  ? "bg-gray-300 border-gray-400 cursor-not-allowed text-gray-500"
                  : isSeatSelected(seatNumber)
                  ? "bg-green-500 border-green-600 text-white"
                  : "bg-white border-indigo-600 hover:bg-blue-100"
              }`}
              onClick={() => handleSeatClick(seatNumber)}
              disabled={isSeatUnavailable(seatNumber)}
            >
              {seatNumber}
            </button>
            <div className="h-2 bg-gray-400 rounded-b-sm mx-1"></div>
          </div>
        );
      }

      seats.push(
        <div key={`row-${row}`} className="flex justify-center mb-3">
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  return (
    <div className="max-w-6xl  my-5 mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Select Your Seats</h2>

      <div className="flex flex-col md:flex-row md:gap-8">
        <div className="flex-1">
          <div className="w-full flex justify-center mb-6">
            <div className="bg-gray-300 rounded-t-xl w-1/2 h-10 flex items-center justify-center font-bold">
              click a seat to choose
            </div>
          </div>

          <div className="mb-8">{renderSeats()}</div>

          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white border-2 border-blue-500 mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 border-2 border-green-600 mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 mr-2"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </div>

        <div className="md:w-72 md:sticky md:top-6 md:self-start mb-6 md:mb-0 order-first md:order-last">
          <SeatSummary
            selectedSeats={selectedSeats}
            busDetails={bus}
            clearSelectedSeats={() => {
              setSelectedSeats([]);
            }}
          />
        </div>
      </div>
    </div>
  );
}
