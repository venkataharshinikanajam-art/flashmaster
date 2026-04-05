import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}
