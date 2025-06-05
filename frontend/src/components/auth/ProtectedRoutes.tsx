import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import {
  selectIsAuthenticated,
  selectRole,
} from "../../features/auth/authSlice";
import { TUserRole } from "../../types";
import UserLayout from "../../layout/user/UserLayout";

interface ProtectedRouteProps {
  allowedRoles: TUserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currRole = useAppSelector(selectRole);

  if (!isAuthenticated || !currRole || !allowedRoles.includes(currRole)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <UserLayout>
        <Outlet />
      </UserLayout>
    </>
  );
};

export default ProtectedRoute;
