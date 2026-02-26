import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SubmitStrategy from "./pages/SubmitStrategy";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AIStrategies from "./pages/AIStrategies";
import LiveTrading from "./pages/LiveTrading";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import TradeJournal from "./pages/TradeJournal";
import ChartAnalysis from "./pages/ChartAnalysis";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import CapitalAllocation from "./pages/CapitalAllocation";
import CapitalAllocationStart from "./pages/CapitalAllocationStart";
import CapitalAllocationDashboard from "./pages/CapitalAllocationDashboard";
import CapitalAllocationAnalytics from "./pages/CapitalAllocationAnalytics";
import CapitalAllocationMethodology from "./pages/CapitalAllocationMethodology";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Contact from "./pages/Contact";
import ApiDocumentation from "./pages/ApiDocumentation";
import CaseStudies from "./pages/CaseStudies";
import HelpCenter from "./pages/HelpCenter";
import StrategyGuide from "./pages/StrategyGuide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RiskDisclosure from "./pages/RiskDisclosure";
import Compliance from "./pages/Compliance";

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
          <Route path="/chart-analysis" element={<ChartAnalysis />} />
          <Route path="/live-trading" element={<LiveTrading />} />
          <Route path="/trade-journal" element={<TradeJournal />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          {/* Capital Allocation Engine */}
          <Route path="/capital-allocation" element={<CapitalAllocation />} />
          <Route path="/capital-allocation/start" element={<CapitalAllocationStart />} />
          <Route path="/capital-allocation/dashboard" element={<CapitalAllocationDashboard />} />
          <Route path="/capital-allocation/analytics" element={<CapitalAllocationAnalytics />} />
          <Route path="/capital-allocation/methodology" element={<CapitalAllocationMethodology />} />
          {/* Product Pages */}
          <Route path="/api-documentation" element={<ApiDocumentation />} />
          {/* Company Pages */}
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/contact" element={<Contact />} />
          {/* Resources Pages */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/strategy-guide" element={<StrategyGuide />} />
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/risk-disclosure" element={<RiskDisclosure />} />
          <Route path="/compliance" element={<Compliance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
