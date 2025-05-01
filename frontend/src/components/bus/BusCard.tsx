import { Calendar, Clock, Users, Moon, Sun } from "lucide-react";
import { TBus } from "../../types/bus";

const BusTypeIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case "sleeper":
      return <Moon className="h-5 w-5" />;
    case "ac":
      return <Sun className="h-5 w-5" />;
    default:
      return <Sun className="h-5 w-5" />;
  }
};

const getTime = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getJourneyTime = (departure: string, arrival: string) => {
  const departureDate = new Date(departure);
  const arrivalDate = new Date(arrival);

  const diffInHours =
    Math.abs(arrivalDate.getTime() - departureDate.getTime()) / 36e5;

  if (diffInHours < 1) {
    return `${Math.round(diffInHours * 60)}m`;
  }

  const hours = Math.floor(diffInHours);
  const minutes = Math.round((diffInHours - hours) * 60);

  return `${hours}h ${minutes}m`;
};

const BusCard = ({ bus }: { bus: TBus }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <BusTypeIcon type={bus.busType} />
              <h3 className="text-lg font-semibold text-gray-800 ml-2">
                {bus.busNumber}
              </h3>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full uppercase">
                {bus.busType}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mt-1">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{getTime(bus.departureTime)}</span>
              </div>
              <span className="hidden sm:block mx-2">-</span>
              <div className="flex items-center mt-1 sm:mt-0">
                <Clock className="h-4 w-4 mr-1" />
                <span>{getTime(bus.arrivalTime)}</span>
              </div>
              <span className="hidden sm:block mx-2">•</span>
              <span className="mt-1 sm:mt-0">
                {getJourneyTime(bus.departureTime, bus.arrivalTime)}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 mt-2">
              <span className="font-medium">{bus.source}</span>
              <span className="mx-2">to</span>
              <span className="font-medium">{bus.destination}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold text-indigo-600">
              ₹{bus.price}
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Users className="h-4 w-4 mr-1" />
              <span>{bus.availableSeats} seats available</span>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center text-sm text-gray-500 mb-4 sm:mb-0">
            <div className="flex items-center px-2 py-1 bg-gray-100 rounded-full">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(bus.departureTime)}</span>
            </div>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors w-full sm:w-auto">
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
