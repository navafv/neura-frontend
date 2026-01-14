import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth(); // Assuming user object contains role info if needed

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user?.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
