import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Terminal, LogOut } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const navigate = useNavigate();

  // Listen for login changes
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("access_token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "IT Fest", path: "/fest" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Gallery", path: "/gallery" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

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

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">
                {link.name}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
                <Link to="/admin-dashboard" className="text-sm font-bold text-cyan-400">Dashboard</Link>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/register" className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105">
                Join Fest
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300"><Menu /></button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden bg-slate-800 border-b border-slate-700 p-4 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block text-slate-300 text-lg">{link.name}</Link>
            ))}
            {!isLoggedIn && <Link to="/login" className="block text-cyan-400 font-bold">Admin Login</Link>}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;