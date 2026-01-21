import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SubmitStrategy from "./pages/SubmitStrategy";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import AIStrategies from "./pages/AIStrategies";
import LiveTrading from "./pages/LiveTrading";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/submit-strategy" element={<SubmitStrategy />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Dashboard Sub-pages */}
          <Route path="/ai-strategies" element={<AIStrategies />} />
          <Route path="/live-trading" element={<LiveTrading />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          {/* Product Pages */}
          <Route path="/api-documentation" element={<ComingSoon />} />
          {/* Company Pages */}
          <Route path="/about-us" element={<ComingSoon />} />
          <Route path="/careers" element={<ComingSoon />} />
          <Route path="/press" element={<ComingSoon />} />
          <Route path="/contact" element={<ComingSoon />} />
          {/* Resources Pages */}
          <Route path="/blog" element={<ComingSoon />} />
          <Route path="/case-studies" element={<ComingSoon />} />
          <Route path="/help-center" element={<ComingSoon />} />
          <Route path="/strategy-guide" element={<ComingSoon />} />
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<ComingSoon />} />
          <Route path="/terms-of-service" element={<ComingSoon />} />
          <Route path="/risk-disclosure" element={<ComingSoon />} />
          <Route path="/compliance" element={<ComingSoon />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
