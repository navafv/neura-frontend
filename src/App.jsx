import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Fest from "./pages/Fest";
import EventDetails from "./pages/EventDetails";
import Leaderboard from "./pages/Leaderboard";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fest" element={<Fest />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
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
    </Router>
  );
}

export default App;
