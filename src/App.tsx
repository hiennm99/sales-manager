// src/App.tsx
import { useAuthStore } from "@features";
import { router } from "@router";
import { useExchangeRateStore } from "@stores";
import { useUserStore } from "@stores/useUserStore";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

function App() {
  const { initialize } = useAuthStore();
  const { initialize: initializeUser } = useUserStore();

  // Initialize auth, user stores, and fetch exchange rate on app mount
  useEffect(() => {
    console.log("[App] Mounting, initializing auth, user stores, and fetching exchange rate...");
    initialize();
    initializeUser();
    useExchangeRateStore.getState().fetchExchangeRate();
  }, [initialize, initializeUser]);

  const exchangeRate = useExchangeRateStore((state) => state.exchangeRate);
  console.log("[App] Current exchange rate:", exchangeRate);

  return <RouterProvider router={router} />;
}

export default App;
