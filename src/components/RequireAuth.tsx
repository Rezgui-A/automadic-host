import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Double-check session if user is null but loading is false
    if (!loading && !user && session) {
      // This handles cases where the auth state might be out of sync
      navigate('/auth', { state: { from: location }, replace: true });
    }
  }, [user, loading, session, navigate, location]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stacks-purple"></div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page with return location
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export default RequireAuth;