import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

// A wrapper component for pages that need login.
// If not logged in, it redirects to /login.
// If a specific role is needed, it redirects to /dashboard when the user
// does not have that role.
export default function ProtectedRoute(props) {
  const auth = useAuth();
  const user = auth.user;
  const loading = auth.loading;
  const requiredRole = props.role;

  if (loading) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  return props.children;
}
