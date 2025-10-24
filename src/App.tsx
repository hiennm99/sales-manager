// App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "./features/auth/store/useAuthStore";
import { router } from "./router";
import { useExchangeRateStore } from "./store/useExchangeRateStore";
import { useUserStore } from "./store/useUserStore";

function App() {
  const { initialize } = useAuthStore();
  const { initialize: initializeUser } = useUserStore();

  // Initialize auth, user store, and fetch exchange rate on app mount
  useEffect(() => {
    console.log("[App] Mounting, initializing auth, user store, and fetching exchange rate...");
    initialize();
    initializeUser();
    useExchangeRateStore.getState().fetchExchangeRate();
  }, [initialize, initializeUser]);

  const exchangeRate = useExchangeRateStore((state) => state.exchangeRate);
  console.log("[App] Current exchange rate:", exchangeRate);

  return <RouterProvider router={router} />;
}

export default App;
