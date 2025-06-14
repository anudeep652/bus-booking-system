import { useNavigate, useSearchParams } from "react-router-dom";
import { TBus, TBusSearchParams } from "../types";
import { useGetBusesQuery } from "../features/bus/busApi";
import { lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";

const BusCard = lazy(() => import("../components/bus/BusCard"));

const LazyBusCard = ({ bus }: { bus: TBus }) => {
  const { ref, inView } = useInView({});

  return (
    <div ref={ref} className="min-h-[100px]">
      <Suspense
        fallback={
          <div className="p-4 border rounded-lg animate-pulse bg-gray-100">
            Loading bus details...
          </div>
        }
      >
        {inView && <BusCard bus={bus} key={bus.id} />}
      </Suspense>
    </div>
  );
};

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
        <LazyBusCard bus={bus} key={bus.id} />
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
