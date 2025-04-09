import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NetworkPage from "./pages/NetworkPage";
import StoragePage from "./pages/StoragePage";
import NotFound from "./pages/NotFound";
import DatabaseWarning from "./components/DatabaseWarning";

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("Current pathname:", location.pathname);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DatabaseWarning />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/storage" element={<StoragePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const WrappedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default WrappedApp;
