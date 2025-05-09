import { useNavigate, useSearchParams } from "react-router-dom";
import BusCard from "../components/bus/BusCard";
import { TBusSearchParams } from "../types";
import { useGetBusesQuery } from "../features/bus/busApi";

const BusSearchResults = () => {
  const [p, _] = useSearchParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetBusesQuery(
    Object.fromEntries(p.entries()) as TBusSearchParams
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium text-gray-700">
          Loading buses...
        </div>
      </div>
    );
  }

  const buses = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-10 gap-5 flex flex-col min-h-screen">
      {buses.map((bus) => (
        <BusCard bus={bus} key={bus.id} />
      ))}
      {buses.length === 0 && (
        <div className="flex flex-col items-center content-center">
          <div>No buses with the filter</div>
          <button
            className="bg-indigo-600 text-white px-3 py-3 rounded-lg my-5"
            onClick={() => {
              navigate("/");
            }}
          >
            Go to search page
          </button>
        </div>
      )}
    </div>
  );
};

export default BusSearchResults;
