import { useState } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Terminal, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [isStudent, setIsStudent] = useState(true); // Default to Student Login
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    credential: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (isStudent) {
        // STUDENT LOGIN
        res = await api.post("student-login/", {
          credential: credentials.credential,
        });
      } else {
        // ADMIN LOGIN
        res = await api.post("token/", {
          username: credentials.username,
          password: credentials.password,
        });
      }

      // Login success
      const success = await login(res.data.access);
      if (success) {
        toast.success(
          isStudent ? "Welcome back, Student!" : "Admin Access Granted"
        );
        // Redirect to dashboard or previous page
        const from =
          location.state?.from?.pathname ||
          (isStudent ? "/dashboard" : "/admin-dashboard");
        navigate(from);
      } else {
        toast.error("Session initialization failed");
      }
    } catch (err) {
      console.error(err);
      if (isStudent && err.response?.status === 404) {
        toast.error(
          "No registration found. Please register for an event first."
        );
      } else {
        toast.error("Invalid Credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-4xl border border-slate-700 w-full max-w-md shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-lg shadow-cyan-900/20">
            <Terminal size={32} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Access your Neura portal</p>
        </div>

        {/* Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1.5 rounded-xl mb-8">
          <button
            onClick={() => setIsStudent(true)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              isStudent
                ? "bg-cyan-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User size={16} /> Student
          </button>
          <button
            onClick={() => setIsStudent(false)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              !isStudent
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck size={16} /> Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {isStudent ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Email or Phone
              </label>
              <input
                type="text"
                required
                placeholder="Enter your registered email/phone"
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
                onChange={(e) =>
                  setCredentials({ ...credentials, credential: e.target.value })
                }
              />
              <p className="text-xs text-slate-500 ml-1">
                * Must match the details used during registration.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Admin Username"
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-purple-500 transition-colors"
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <button
            disabled={loading}
            className={`w-full py-4 mt-6 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg ${
              isStudent
                ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20"
                : "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Login <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {isStudent && (
          <p className="text-center mt-6 text-slate-500 text-sm">
            Not registered yet?{" "}
            <a
              href="/register"
              className="text-cyan-400 font-bold hover:underline"
            >
              Join an event
            </a>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
