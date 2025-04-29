import { Bus } from "lucide-react";
import { ReactNode } from "react";

export const AuthLayout = ({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-700 opacity-20"></div>
        <div className="relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Bus size={64} className="text-indigo-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">TravelEase</h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Your journey begins with a single click
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <p className="text-white text-lg">
              Access your account to book tickets, manage reservations, and
              enjoy seamless travel planning.
            </p>
          </div>
        </div>

        <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-400 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-indigo-300 rounded-full opacity-20"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
