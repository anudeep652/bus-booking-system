import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthRoutes from "./AuthRoutes";
import ProtectedRoute from "../components/auth/ProtectedRoutes";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated, selectRole } from "../features/auth/authSlice";
import Home from "../pages/Home";
import BusSearchResults from "../pages/BusSearchResults";
import BookBus from "../pages/BookBus";
import BookingSuccess from "../pages/BookingSuccess";
import BookingHistory from "../pages/BookingHistory";

const Dashboard = () => <Home />;
const UserBookings = () => <div>User Bookings</div>;
const AdminPanel = () => <div>Admin Panel</div>;
const OperatorPanel = () => <div>Operator Panel</div>;

const MainRoutes: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectRole);

  console.log("Is Authenticated:", isAuthenticated);

  const getDashboardPath = () => {
    console.log("Role:", role);
    switch (role) {
      case "admin":
        console.log("Admin role detected");
        return "/admin/dashboard";
      case "operator":
        return "/operator/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <Routes>
      <Route path="/*" element={<AuthRoutes />} />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardPath()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected routes for all authenticated users */}
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<UserBookings />} />
        <Route path="/bus/search" element={<BusSearchResults />} />
        <Route path="/book-bus/:id" element={<BookBus />} />
        <Route path="/success" element={<BookingSuccess />} />
        <Route path="/history" element={<BookingHistory />} />
      </Route>

      {/* User specific routes */}

      {/* Admin specific routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminPanel />} />
      </Route>

      {/* Operator specific routes */}
      <Route element={<ProtectedRoute allowedRoles={["operator"]} />}>
        <Route path="/operator/dashboard" element={<OperatorPanel />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default MainRoutes;
