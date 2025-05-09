import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getBusses } from "../features/bus/busService";
import { selectBuses } from "../features/bus/busSlice";
import BusCard from "../components/bus/BusCard";
import { TBusSearchParams } from "../types";
import { useEffect } from "react";

const BusSearchResults = () => {
  const [p, _] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  console.log(Object.fromEntries(p.entries()));

  useEffect(() => {
    dispatch(getBusses(Object.fromEntries(p.entries()) as TBusSearchParams));
  }, [dispatch]);

  const buses = useAppSelector(selectBuses);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-10 gap-5 flex flex-col">
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
            {" "}
            Go to search page
          </button>
        </div>
      )}
    </div>
  );
};

export default BusSearchResults;
