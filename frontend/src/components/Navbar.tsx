import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Search,
  Ticket,
  Clock,
  User,
  HelpCircle,
  LogOut,
  Bell,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, selectUser } from "../features/auth/authSlice";

const Navbar = () => {
  const menuItems = [
    {
      label: "Home",
      icon: <Home size={18} />,
      href: "/",
      identifier: "/dashboard",
    },
    {
      label: "My Bookings",
      icon: <Ticket size={18} />,
      href: "/bookings",
      identifier: "/bookings",
    },
    {
      label: "Trip History",
      icon: <Clock size={18} />,
      href: "/history",
      identifier: "/history",
    },
    {
      label: "Help & Support",
      icon: <HelpCircle size={18} />,
      href: "#",
      identifier: "/help",
    },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const dispatch = useAppDispatch();
  const userSelector = useAppSelector(selectUser);
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center mr-2">
                <span className="font-bold text-white">BB</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                BusBooker
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-center space-x-6">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`${
                    currentPage === item.identifier &&
                    "text-indigo-700 border-b-2 border-indigo-600"
                  } text-gray-600 hover:text-indigo-700 hover:border-b-2 hover:border-indigo-600 px-1 py-2 text-sm font-medium flex items-center transition-colors duration-200`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative mr-4">
              <button className="p-1 text-gray-600 hover:text-violet-700 rounded-full focus:outline-none">
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            <div className="ml-3 relative hidden md:block">
              <div className="flex items-center">
                <button className="cursor-pointer flex items-center text-sm rounded-full text-violet-800 hover:text-violet-600 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center mr-2">
                    <User size={16} className="text-indigo-600" />
                  </div>
                  <span className="font-medium text-sm text-indigo-600">
                    {userSelector?.name}
                  </span>
                </button>
                <button
                  className="ml-4 text-gray-600 hover:text-violet-700 focus:outline-none cursor-pointer"
                  onClick={() => dispatch(logout())}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            <div className="flex md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-violet-700 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-gray-700 hover:bg-violet-50 hover:text-violet-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="px-3 flex items-center">
              <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                <User size={20} className="text-indigo-600" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {userSelector?.name}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {userSelector?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-3 py-2">
              <a
                href="#"
                className="text-gray-700 hover:bg-violet-50 hover:text-violet-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                onClick={() => dispatch(logout())}
              >
                <LogOut size={18} className="mr-2" />
                Sign out
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
