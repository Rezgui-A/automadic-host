import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { RoutineProvider } from "./context/RoutineContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import AuthStateHandler from "./components/AuthStateHandler";
import DataProvider from "./components/DataProvider";
import { ThemeProvider } from "./components/ThemeProvider";

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import LibraryPage from "./pages/LibraryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import { useEffect } from "react";
import DataLoader from "./components/DataLoader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (window.location.pathname === "/auth") {
        navigate("/dashboard");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route
      path="/onboarding"
      element={
        <RequireAuth>
          <OnboardingFlow />
        </RequireAuth>
      }
    />
    <Route
      path="/dashboard"
      element={
        <RequireAuth>
          <Index />
        </RequireAuth>
      }
    />
    <Route
      path="/library"
      element={
        <RequireAuth>
          <LibraryPage />
        </RequireAuth>
      }
    />
    <Route
      path="/settings"
      element={
        <RequireAuth>
          <SettingsPage />
        </RequireAuth>
      }
    />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
          <AuthProvider>
            <RoutineProvider>
              <DataProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AuthStateHandler>
                    <AppRoutes />
                  </AuthStateHandler>
                </TooltipProvider>
              </DataProvider>
            </RoutineProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
