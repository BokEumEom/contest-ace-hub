
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import NewContest from "./pages/NewContest";
import ContestDetail from "./pages/ContestDetail";
import AIHelper from "./pages/AIHelper";
import Explore from "./pages/Explore";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Contests from "./pages/Contests";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TestTransition from "./pages/TestTransition";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* All routes are now public */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/new-contest" element={<NewContest />} />
            <Route path="/contest/:id" element={<ContestDetail />} />
            <Route path="/ai-helper" element={<AIHelper />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/test-transition" element={<TestTransition />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
