import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import Fest from "./pages/Fest";
import Schedule from "./pages/Schedule";
import Leaderboard from "./pages/Leaderboard";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import About from "./pages/About";
import EventDetails from "./pages/EventDetails";
import QualifiedStudents from "./pages/QualifiedStudents"; // Import the new page

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="bg-slate-900 min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#fff",
              border: "1px solid #334155",
            },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/fest" element={<Fest />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/qualifiers" element={<QualifiedStudents />} />{" "}
          {/* New Route */}
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ParticipantDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
