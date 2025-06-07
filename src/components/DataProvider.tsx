import { useEffect } from "react";
import { useSupabaseSync } from "../hooks/useSupabaseSync";
import { useAuth } from "../context/AuthContext";

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { session, user } = useAuth();
  const { fetchUserData, isLoading } = useSupabaseSync();

  // Fetch data when session is ready
  useEffect(() => {
    if (session?.access_token && user?.id) {
      fetchUserData(true);
    }
  }, [session?.access_token, user?.id]);

  // Show loading spinner while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default DataProvider;
