import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { EventsManager } from "../components/admin/EventsManager";
import { LiveEventPanel } from "../components/admin/LiveEventPanel";
import { Modal } from "../components/ui/Modal";
import { Card } from "../components/ui/Card";
import { Calendar, Crown, Image, MessageSquare, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await api.get("user/me/");
        setUser(userRes.data);
        const eventRes = await api.get("events/my_events/");
        setEvents(eventRes.data.results || eventRes.data);
      } catch {
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load specific event stats
  const loadEventStats = async (id) => {
    try {
      const res = await api.get(`events/${id}/dashboard_data/`);
      setEventStats(res.data);
      setSelectedEventId(id);
    } catch {
      toast.error("Failed to load event data");
    }
  };

  if (loading || !user)
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center text-cyan-400">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <Card className="text-center py-8">
            <div className="w-20 h-20 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-cyan-500/20">
              {user.username[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-slate-400 text-sm mb-6">
              {user.is_superuser ? "Super Admin" : "Coordinator"}
            </p>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-red-400 hover:text-red-300 text-sm font-bold flex items-center justify-center gap-2 mx-auto"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </Card>

          <nav className="space-y-2">
            <NavButton
              icon={<Calendar />}
              label="Events"
              active={activeTab === "events"}
              onClick={() => setActiveTab("events")}
            />
            {user.is_superuser && (
              <>
                <NavButton
                  icon={<Crown />}
                  label="Fests"
                  active={activeTab === "fests"}
                  onClick={() => setActiveTab("fests")}
                />
                <NavButton
                  icon={<Image />}
                  label="Gallery"
                  active={activeTab === "gallery"}
                  onClick={() => setActiveTab("gallery")}
                />
                <NavButton
                  icon={<MessageSquare />}
                  label="Feedback"
                  active={activeTab === "feedback"}
                  onClick={() => setActiveTab("feedback")}
                />
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-8">
          {activeTab === "events" && (
            <>
              <EventsManager
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={loadEventStats}
                user={user}
                // Add handlers for edit/create/delete logic here...
              />

              {selectedEventId && eventStats && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="h-px bg-slate-800 my-8" />
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Live Operations
                    </h2>
                    <span className="text-cyan-400 text-sm font-bold bg-cyan-900/30 px-3 py-1 rounded-full animate-pulse">
                      ● Live
                    </span>
                  </div>
                  <LiveEventPanel
                    event={events.find((e) => e.id === selectedEventId)}
                    stats={eventStats}
                    user={user}
                    // Pass specific handlers (onAddRound, onPromote) defined in step 5...
                  />
                </div>
              )}
            </>
          )}

          {/* Placeholders for other tabs */}
          {activeTab !== "events" && (
            <Card className="h-96 flex items-center justify-center text-slate-500">
              Module Under Refactor
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
      active
        ? "bg-slate-800 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/10"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`}
  >
    {icon} {label}
  </button>
);

export default AdminDashboard;
