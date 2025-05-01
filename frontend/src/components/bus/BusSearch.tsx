import { useState } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Bus,
  ArrowRight,
  BanknoteArrowDown,
  BanknoteArrowUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BusSearch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    startDate: "",
    endDate: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    navigate("/bus/search?" + new URLSearchParams(formData).toString());
    if (e) {
      e.preventDefault();
    }
    console.log("Searching for buses with data:", formData);
  };

  const popularRoutes = [
    { from: "CBE", to: "Chennai" },
    { from: "CBE", to: "BLR" },
    { from: "Mumbai", to: "Delhi" },
    { from: "Madurai", to: "CBE" },
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-violet-500" />
                </div>
                <input
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-violet-500" />
                </div>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter city or station"
                  className="pl-10 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-violet-500" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End date (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-violet-500" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                minimum price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BanknoteArrowDown size={18} className="text-violet-500" />
                </div>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  placeholder="minimum price"
                  className="pl-10 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                maximum price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BanknoteArrowUp size={18} className="text-violet-500" />
                </div>
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleChange}
                  placeholder="maximum price"
                  className="pl-10 block w-full rounded-md border-gray-300 border p-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="lg:col-span-1 flex items-end">
              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
              >
                <Search size={18} className="mr-1" />
                Search
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Popular Routes
            </h3>
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
                  className="flex items-center justify-between p-2 text-sm bg-violet-50 hover:bg-violet-100 rounded-md text-violet-800 transition duration-300"
                >
                  <div className="flex items-center">
                    <Bus size={16} className="mr-2 text-violet-600" />
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
            <div className="text-violet-700 font-bold mb-2">Save Up to 30%</div>
            <p className="text-sm text-gray-600">
              Book return tickets and save on your journey
            </p>
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow">
            <div className="text-violet-700 font-bold mb-2">
              Flexible Booking
            </div>
            <p className="text-sm text-gray-600">
              Change your travel dates with minimal fees
            </p>
          </div>
          <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow">
            <div className="text-violet-700 font-bold mb-2">24/7 Support</div>
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
