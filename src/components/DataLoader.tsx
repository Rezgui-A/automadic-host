import { useEffect, useRef } from "react";
import { useSupabaseSync } from "../hooks/useSupabaseSync";
import { useAuth } from "../context/AuthContext";

export const DataLoader = () => {
  const { session, user } = useAuth();
  const { fetchUserData, hasFetched } = useSupabaseSync();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Force fetch on initial mount
      fetchUserData(true);
    }
  }, [fetchUserData]);

  // Re-fetch when auth state changes
  useEffect(() => {
    if (session?.access_token && user?.id) {
      fetchUserData(true);
    }
  }, [session?.access_token, user?.id, fetchUserData]);

  return null;
};

export default DataLoader;
