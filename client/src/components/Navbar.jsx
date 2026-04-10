import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to={user ? "/dashboard" : "/"} className="text-xl font-bold text-white">
          FLASH<span className="text-indigo-400">MASTER</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
              <Link to="/materials" className="text-slate-300 hover:text-white">Materials</Link>
              <Link to="/flashcards" className="text-slate-300 hover:text-white">Flashcards</Link>
              <Link to="/plans" className="text-slate-300 hover:text-white">Plans</Link>
              <Link to="/progress" className="text-slate-300 hover:text-white">Progress</Link>
              <Link to="/analytics" className="text-slate-300 hover:text-white">Analytics</Link>
              {user.role === "admin" && (
                <Link to="/admin" className="text-amber-300 hover:text-amber-200">Admin</Link>
              )}
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-slate-300 hover:text-white underline-offset-4 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white">Login</Link>
              <Link
                to="/signup"
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-white hover:bg-indigo-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
