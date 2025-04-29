import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginContainer from "../pages/LoginContainer";
import RegisterContainer from "../pages/RegisterContainer";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSlice";

interface AuthRoutesProps {}

const AuthRoutes: React.FC<AuthRoutesProps> = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginContainer />} />
      <Route path="/register" element={<RegisterContainer />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;
