import React, { useState } from "react";
import { Search, MapPin, Bus, ArrowRight, FilterX, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TBusSearch, TBusSearchParams, TBusType } from "../../types";

const BusSearch = () => {
  const navigate = useNavigate();
  const defaultValues: TBusSearch = {
    source: "",
    destination: "",
    startDate: "",
    endDate: "",
    priceRange: [0, 5000],
    ratings: 0,
    busType: [],
  };

  const [formData, setFormData] = useState<TBusSearch>({ ...defaultValues });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleBusTypeChange = (type: TBusType) => {
    setFormData((prev) => {
      const currentBusTypes = [...prev.busType];
      if (currentBusTypes.includes(type)) {
        return {
          ...prev,
          busType: currentBusTypes.filter((t) => t !== type),
        };
      } else {
        return {
          ...prev,
          busType: [...currentBusTypes, type],
        };
      }
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      priceRange:
        name === "minPrice"
          ? [parseInt(value), prev.priceRange[1]]
          : [prev.priceRange[0], parseInt(value)],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const searchParams: Partial<TBusSearchParams> = {};

    if (formData.source !== defaultValues.source)
      searchParams.source = formData.source;
    if (formData.destination !== defaultValues.destination)
      searchParams.destination = formData.destination;
    if (formData.startDate !== defaultValues.startDate)
      searchParams.startDate = formData.startDate;
    if (formData.endDate !== defaultValues.endDate)
      searchParams.endDate = formData.endDate;

    if (formData.priceRange[0] !== defaultValues.priceRange[0])
      searchParams.minPrice = formData.priceRange[0].toString();
    if (formData.priceRange[1] !== defaultValues.priceRange[1])
      searchParams.maxPrice = formData.priceRange[1].toString();

    if (formData.ratings !== defaultValues.ratings)
      searchParams.ratings = formData.ratings.toString();

    if (formData.busType.length > 0)
      searchParams.busType = formData.busType.join(",");

    navigate("/bus/search?" + new URLSearchParams(searchParams).toString());
    console.log("Searching for buses with data:", formData);
  };

  const popularRoutes = [
    { from: "CBE", to: "Chennai" },
    { from: "CBE", to: "BLR" },
    { from: "Mumbai", to: "Delhi" },
    { from: "Madurai", to: "CBE" },
  ];

  const busTypes: { id: TBusType; label: string }[] = [
    { id: "ac", label: "AC" },
    { id: "nonAc", label: "Non AC" },
    { id: "sleeper", label: "Sleeper" },
    { id: "seater", label: "Seater" },
  ];

  return (
    <div className="w-full bg-indigo-600 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Find Your Perfect Bus Journey
          </h1>
          <p className="text-violet-200">
            Thousands of destinations, one simple search
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="from"
              >
                From
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-violet-500" />
                </div>
                <input
                  id="from"
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="Enter city or station"
                  className="pl-10 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="to"
              >
                To
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-violet-500" />
                </div>
                <input
                  id="to"
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter city or station"
                  className="pl-10 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="startDate"
              >
                Start date
              </label>
              <div className="grid grid-cols-1 gap-2">
                <input
                  id="startDate"
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="endDate"
              >
                End date (Optional)
              </label>
              <div className="grid grid-cols-1 gap-2">
                <input
                  id="endDate"
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="pl-5 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FilterX size={18} className="mr-2 text-violet-500" />
              Filters
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={formData.priceRange[0]}
                    onChange={handlePriceChange}
                    placeholder="Min"
                    className="w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={formData.priceRange[1]}
                    onChange={handlePriceChange}
                    placeholder="Max"
                    className="w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <Star size={18} className="mr-1 text-yellow-400" />
                  Minimum Rating
                </label>
                <select
                  id="rating"
                  name="ratings"
                  value={formData.ratings}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="0">Any Rating</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Bus size={18} className="mr-1 text-violet-500" />
                  Bus Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {busTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleBusTypeChange(type.id)}
                      className={`px-3 py-1 text-sm rounded-full transition-all ${
                        formData.busType.includes(type.id)
                          ? "bg-violet-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex md:justify-end ">
              <button
                onClick={handleSubmit}
                className="w-full md:w-auto bg-indigo-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 flex items-center justify-center"
              >
                <Search size={20} className="mr-2" />
                Search Buses
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Popular Routes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {popularRoutes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      source: route.from,
                      destination: route.to,
                    });
                  }}
                  className="flex items-center justify-between p-2 text-sm bg-indigo-50 hover:bg-indigo-100 rounded-md text-indigo-800 transition duration-300"
                >
                  <div className="flex items-center">
                    <Bus size={16} className="mr-2 text-indigo-600" />
                    <span>{route.from}</span>
                  </div>
                  <ArrowRight size={14} className="mx-1 text-violet-400" />
                  <span>{route.to}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow">
            <div className="text-indigo-700 font-bold mb-2">Save Up to 30%</div>
            <p className="text-sm text-gray-600">
              Book return tickets and save on your journey
            </p>
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow">
            <div className="text-indigo-700 font-bold mb-2">
              Flexible Booking
            </div>
            <p className="text-sm text-gray-600">
              Change your travel dates with minimal fees
            </p>
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow">
            <div className="text-indigo-700 font-bold mb-2">24/7 Support</div>
            <p className="text-sm text-gray-600">
              Our team is here to help whenever you need
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusSearch;
