import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginContainer from "../pages/LoginContainer";
const RegisterContainer = lazy(() => import("../pages/RegisterContainer"));
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSlice";

interface AuthRoutesProps {}

const AuthRoutes: React.FC<AuthRoutesProps> = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginContainer />} />
      </Routes>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/register" element={<RegisterContainer />} />
        </Routes>
      </React.Suspense>
    </>
  );
};

export default AuthRoutes;
