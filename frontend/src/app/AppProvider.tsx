import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./store";

type TAppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider: React.FC<TAppProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <Router>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              style: {
                background: "#22c55e",
              },
            },
            error: {
              duration: 4000,
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
      </Router>
    </Provider>
  );
};
