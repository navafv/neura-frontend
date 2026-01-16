import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Terminal, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "IT Fest", path: "/fest" },
    { name: "Schedule", path: "/schedule" },
    { name: "Qualifiers", path: "/qualifiers" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Gallery", path: "/gallery" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const dashboardLink =
    user?.is_superuser || user?.is_coordinator
      ? "/admin-dashboard"
      : "/dashboard";

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <Terminal className="text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-black bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tighter">
              NEURA
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {" "}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-300 hover:text-cyan-400 font-medium transition-colors text-sm"
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
                <Link
                  to={dashboardLink}
                  className="text-sm font-bold text-cyan-400"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-cyan-400 font-medium transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105"
                >
                  Join Fest
                </Link>
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300"
            >
              <Menu />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-slate-800 border-b border-slate-700 p-4 space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-slate-300 text-lg"
              >
                {link.name}
              </Link>
            ))}

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-300 text-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-cyan-400 font-bold text-lg"
                >
                  Join Fest
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={dashboardLink}
                  onClick={() => setIsOpen(false)}
                  className="block text-cyan-400 font-bold text-lg"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block text-red-400 font-bold text-lg w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
