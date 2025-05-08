import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getBusses } from "../features/bus/busService";
import { selectBuses } from "../features/bus/busSlice";
import BusCard from "../components/bus/BusCard";
import { TBusSearchParams } from "../types";
import { useEffect } from "react";

const BusSearchResults = () => {
  const p = useSearchParams();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getBusses(Object.fromEntries(p[0].entries()) as TBusSearchParams));
  }, [dispatch]);

  const buses = useAppSelector(selectBuses);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-10 gap-5 flex flex-col">
      {buses.map((bus) => (
        <BusCard bus={bus} key={bus.id} />
      ))}
    </div>
  );
};

export default BusSearchResults;
