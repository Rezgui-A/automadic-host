// components/AuthStateHandler.tsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthStateHandler = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!loading && !hasNavigatedRef.current) {
      const currentPath = window.location.pathname;
      const authPaths = ["/auth", "/onboarding"];
      const protectedPaths = ["/dashboard", "/library", "/settings"];
      let shouldNavigate = false;
      let targetPath = "";

      if (!user) {
        // If not authenticated and trying to access protected route
        if (protectedPaths.some((path) => currentPath.startsWith(path))) {
          shouldNavigate = true;
          targetPath = "/auth";
        }
      } else {
        // If authenticated but on auth page
        if (authPaths.includes(currentPath)) {
          shouldNavigate = true;
          targetPath = "/dashboard";
        }
      }

      if (shouldNavigate && targetPath) {
        hasNavigatedRef.current = true;
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Reset navigation flag when auth state changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [user, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

// Add this default export
export default AuthStateHandler;
