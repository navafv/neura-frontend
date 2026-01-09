import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the access token exists in local storage
  const isAuthenticated = localStorage.getItem('access_token');

  if (!isAuthenticated) {
    // If not logged in, send them to the login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the requested page (children)
  return children;
};

export default ProtectedRoute;