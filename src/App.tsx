// App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "./features/auth/store/useAuthStore";
import { router } from "./router";
import { useExchangeRateStore } from "./store/useExchangeRateStore";

function App() {
  const { initialize } = useAuthStore();

  // Initialize auth and fetch exchange rate on app mount
  useEffect(() => {
    console.log("[App] Mounting, initializing auth and fetching exchange rate...");
    initialize();
    useExchangeRateStore.getState().fetchExchangeRate();
  }, [initialize]);

  const exchangeRate = useExchangeRateStore((state) => state.exchangeRate);
  console.log("[App] Current exchange rate:", exchangeRate);

  return <RouterProvider router={router} />;
}

export default App;
