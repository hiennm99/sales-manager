// src/App.tsx
import "./App.css";

import { ThemeProvider } from "@components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { RouterProvider } from "react-router-dom";

import NotificationContainer from "./components/ui/NotificationContainer";
import { router } from "./router";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <NotificationContainer />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
