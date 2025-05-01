import { useSearchParams } from "react-router-dom";
import UserLayout from "../layout/user/userLayout";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getBusses } from "../features/bus/busService";
import { selectBuses } from "../features/bus/busSlice";
import BusCard from "../components/bus/BusCard";

const BusSearchResults = () => {
  const p = useSearchParams();
  const dispatch = useAppDispatch();
  console.log(p[0].get("source"));
  dispatch(
    getBusses({
      source: p[0].get("source") || "",
      destination: p[0].get("destination") || "",
      startDate: p[0].get("startDate") || "",
      endDate: p[0].get("endDate") || "",
      minPrice: p[0].get("minPrice") || "",
      maxPrice: p[0].get("maxPrice") || "",
    })
  );
  const buses = useAppSelector(selectBuses);
  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 my-10">
        {buses.map((bus) => (
          <BusCard bus={bus} key={bus.id} />
        ))}
      </div>
    </UserLayout>
  );
};

export default BusSearchResults;
