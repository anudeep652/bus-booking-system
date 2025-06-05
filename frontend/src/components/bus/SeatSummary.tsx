import { TbusSeatSummary } from "../../types";
import { formatDateTime } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useBookBusMutation } from "../../features/booking/bookingApi";
import { Button } from "../Button";
import toast from "react-hot-toast";
import { generateTicketPDF } from "../booking/GenerateBookingTicket";

export const SeatSummary = ({
  selectedSeats,
  busDetails,
  clearSelectedSeats,
}: TbusSeatSummary) => {
  const navigate = useNavigate();
  const [bookBus, { isLoading }] = useBookBusMutation();

  if (!busDetails) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border md:w-max ">
        <h3 className="text-lg font-semibold mb-3">No Bus Selected</h3>
        <p className="text-gray-600">Please select a bus to view details.</p>
      </div>
    );
  }

  const totalPrice = selectedSeats.length * busDetails.price;

  const handleClick = () => {
    bookBus({
      trip_id: busDetails.id,
      seat_numbers: selectedSeats,
      timestamp: new Date().toLocaleDateString(),
    })
      .unwrap()
      .then((resp) => {
        generateTicketPDF(resp.data);

        setTimeout(() => {
          navigate("/success", { state: { success: true } });
        }, 100);
      })
      .catch((err: { message: string }) => {
        toast.error(err.message);
      })
      .finally(() => {
        clearSelectedSeats();
      });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border md:w-max ">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 pb-2 border-b">
          Bus Details
        </h3>

        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Bus Number:</span>
          <span className="font-medium">{busDetails.busNumber}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Bus Type:</span>
          <span className="font-medium capitalize">{busDetails.busType}</span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Route:</span>
          <span className="font-medium">
            {busDetails.source} to {busDetails.destination}
          </span>
        </div>

        <div className="mb-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Departure:</span>
            <span className="font-medium text-right pl-2">
              {formatDateTime(busDetails.departureTime)}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Arrival:</span>
            <span className="font-medium text-right pl-2">
              {formatDateTime(busDetails.arrivalTime)}
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Available Seats:</span>
          <span className="font-medium">{busDetails.availableSeats}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <h3 className="text-lg font-semibold mb-3">Booking Summary</h3>

        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Selected Seats:</span>
          <span className="font-medium">
            {selectedSeats.length > 0
              ? selectedSeats.sort((a, b) => a - b).join(", ")
              : "None"}
          </span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Number of Seats:</span>
          <span className="font-medium">{selectedSeats.length}</span>
        </div>

        <div className="flex justify-between text-lg font-bold mt-3 pt-2 border-t">
          <span>Total Amount:</span>
          <span>₹{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      <Button
        onClick={handleClick}
        isLoading={isLoading}
        className={`w-full py-3 rounded-md font-medium ${
          selectedSeats.length > 0
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={selectedSeats.length === 0}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};
