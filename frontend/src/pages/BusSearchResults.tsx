import { useSearchParams } from "react-router-dom";
import UserLayout from "../layout/user/userLayout";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getBusses } from "../features/bus/busService";
import { selectBuses } from "../features/bus/busSlice";
import BusCard from "../components/bus/BusCard";
import { TBusSearchParams } from "../types/bus";

const BusSearchResults = () => {
  const p = useSearchParams();
  const dispatch = useAppDispatch();
  dispatch(getBusses(Object.fromEntries(p[0].entries()) as TBusSearchParams));

  const buses = useAppSelector(selectBuses);
  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-10 gap-5 flex flex-col">
        {buses.map((bus) => (
          <BusCard bus={bus} key={bus.id} />
        ))}
      </div>
    </UserLayout>
  );
};

export default BusSearchResults;
