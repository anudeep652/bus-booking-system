import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainRoutes from "./routes/MainRoutes";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { logout, selectIsAuthenticated } from "./features/auth/authSlice";
import { useGetCurrentUserQuery } from "./features/auth/authApi";

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  // const { data: _currentUser, error: userError } = useGetCurrentUserQuery(
  //   undefined,
  //   {
  //     skip: !isAuthenticated,
  //   }
  // );

  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== "/register") {
      dispatch(logout());
      navigate("/login");
    }
  }, [isAuthenticated, dispatch, navigate]);

  return (
    <div className="app">
      <MainRoutes />
    </div>
  );
}

export default App;
