
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "./contexts/AssessmentContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AssessmentSummary from "./pages/AssessmentSummary";
import EmailCapture from "./pages/EmailCapture";
import AnswerSummary from "./pages/AnswerSummary";
import CompetitionSignup from "./pages/CompetitionSignup";
import Assessment from "./pages/Assessment";
import AssessmentComplete from "./pages/AssessmentComplete";
import PrivacyPolicy from "./components/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AssessmentProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/competition" element={<CompetitionSignup />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/assessment-complete" element={<AssessmentComplete />} />
            <Route path="/answer-summary/:questionNumber" element={<AnswerSummary />} />
            <Route path="/assessment-summary" element={<AssessmentSummary />} />
            <Route path="/email-capture" element={<EmailCapture />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AssessmentProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
