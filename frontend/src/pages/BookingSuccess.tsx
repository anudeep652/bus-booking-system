import { useEffect } from "react";
import { Check, Home, Printer, Share2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const success = location.state?.success ?? null;

  useEffect(() => {
    if (!success) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    const tickMark = document.getElementById("successTick");
    const successContent = document.getElementById("successContent");

    if (tickMark) {
      setTimeout(() => {
        tickMark.classList.add("scale-100");
        tickMark.classList.remove("scale-0");
      }, 300);
    }

    if (successContent) {
      setTimeout(() => {
        successContent.classList.add("translate-y-0", "opacity-100");
        successContent.classList.remove("translate-y-10", "opacity-0");
      }, 800);
    }
  }, []);

  const goToHomePage = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 flex flex-col items-center">
          <div
            id="successTick"
            className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-4 transform scale-0 transition-transform duration-500"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-500 to-blue-400 flex items-center justify-center">
              <Check size={50} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Booking Successful!</h1>
        </div>

        <div
          id="successContent"
          className="p-6 transform translate-y-10 opacity-0 transition-all duration-700"
        >
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50">
              <Printer size={18} className="mr-2 text-gray-600" />
              <span className="text-gray-800">Print</span>
            </button>
            <button className="flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50">
              <Share2 size={18} className="mr-2 text-gray-600" />
              <span className="text-gray-800">Share</span>
            </button>
          </div>

          <button
            onClick={goToHomePage}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg flex items-center justify-center font-medium transition-colors"
          >
            <Home size={18} className="mr-2" />
            Go to Home Page
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            Having trouble?{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
