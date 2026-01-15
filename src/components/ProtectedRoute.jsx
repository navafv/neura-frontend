import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ALLOW ACCESS IF:
  // 1. Route does NOT require admin (adminOnly=false) OR
  // 2. User is a Superuser OR
  // 3. User is a Coordinator (Event Admin)
  if (adminOnly && !user?.is_superuser && !user?.is_coordinator) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
