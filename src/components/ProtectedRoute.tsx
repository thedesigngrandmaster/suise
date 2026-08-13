import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";

/**
 * Guards authenticated app routes.
 * Unauthenticated visitors are sent to /auth and cannot reach vault/chat/etc by URL.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    // Preserve the intended destination so Auth can redirect back after login.
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
