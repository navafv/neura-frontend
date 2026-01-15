import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { EventsManager } from "../components/admin/EventsManager";
import { LiveEventPanel } from "../components/admin/LiveEventPanel";
import { TeamManager } from "../components/admin/TeamManager";
import { ScheduleManager } from "../components/admin/ScheduleManager";
import { Card } from "../components/ui/Card";
import {
  Calendar,
  Crown,
  Image,
  MessageSquare,
  LogOut,
  Users,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("events");

  // --- Data States ---
  const [events, setEvents] = useState([]);
  const [fests, setFests] = useState([]);
  const [team, setTeam] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // --- View States ---
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // 1. Wait for Auth to be ready
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else {
        loadDashboardData();
      }
    }
  }, [user, authLoading, navigate]);

  // 2. Fetch Data Based on Role
  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // EVERYONE gets their events
      const eventRes = await api.get("events/my_events/");
      setEvents(eventRes.data.results || eventRes.data);

      // ONLY Superusers get the rest
      if (user?.is_superuser) {
        const [festRes, galRes, feedRes, teamRes, schRes] = await Promise.all([
          api.get("fests/"),
          api.get("gallery/"),
          api.get("feedback/"),
          api.get("team/"),
          api.get("schedules/"),
        ]);
        setFests(festRes.data.results || festRes.data);
        setGallery(galRes.data.results || galRes.data);
        setFeedback(feedRes.data.results || feedRes.data);
        setTeam(teamRes.data.results || teamRes.data);
        setSchedules(schRes.data.results || schRes.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard data");
    } finally {
      setDataLoading(false);
    }
  };

  const loadEventStats = async (id) => {
    try {
      const res = await api.get(`events/${id}/dashboard_data/`);
      setEventStats(res.data);
      setSelectedEventId(id);
    } catch {
      toast.error("Access denied to this event");
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-cyan-400 gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <span className="font-bold tracking-widest uppercase">
          Initializing Command Center...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 space-y-6">
          <Card className="text-center py-8 border-slate-700 bg-slate-800/50">
            <div className="w-20 h-20 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-cyan-500/20">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold truncate px-4">
              {user?.username}
            </h2>
            <div className="flex justify-center gap-2 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  user?.is_superuser
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-cyan-500/20 text-cyan-400"
                }`}
              >
                {user?.is_superuser ? "Super Admin" : "Coordinator"}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-red-400 hover:text-red-300 text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </Card>

          <nav className="space-y-2">
            <NavButton
              icon={<Calendar />}
              label="My Events"
              active={activeTab === "events"}
              onClick={() => setActiveTab("events")}
            />

            {/* Conditional Tabs for Superuser Only */}
            {user?.is_superuser && (
              <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-600 uppercase tracking-widest">
                  Global Config
                </div>
                <NavButton
                  icon={<Crown />}
                  label="Fests"
                  active={activeTab === "fests"}
                  onClick={() => setActiveTab("fests")}
                />
                <NavButton
                  icon={<Clock />}
                  label="Schedule"
                  active={activeTab === "schedule"}
                  onClick={() => setActiveTab("schedule")}
                />
                <NavButton
                  icon={<Users />}
                  label="Team"
                  active={activeTab === "team"}
                  onClick={() => setActiveTab("team")}
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

        {/* MAIN CONTENT AREA */}
        <main className="lg:col-span-9 space-y-8">
          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <>
              <EventsManager
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={loadEventStats}
                user={user}
              />

              {selectedEventId && eventStats ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="h-px bg-slate-800 my-8" />
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-8 bg-cyan-500 rounded-full" />
                      Live Operations
                    </h2>
                    <span className="text-cyan-400 text-xs font-bold bg-cyan-900/30 px-3 py-1 rounded-full animate-pulse border border-cyan-500/30">
                      ● REALTIME
                    </span>
                  </div>
                  <LiveEventPanel
                    event={events.find((e) => e.id === selectedEventId)}
                    stats={eventStats}
                    user={user}
                    onRefresh={() => loadEventStats(selectedEventId)} // Pass refresh handler
                  />
                </div>
              ) : (
                <div className="mt-8 p-12 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600">
                  <Calendar className="w-12 h-12 mb-4 opacity-50" />
                  <p>Select an event above to manage rounds and results</p>
                </div>
              )}
            </>
          )}

          {/* SUPERUSER TABS */}
          {user?.is_superuser && (
            <>
              {activeTab === "team" && (
                <TeamManager
                  team={team}
                  onRefresh={() => loadDashboardData()}
                />
              )}
              {activeTab === "schedule" && (
                <ScheduleManager
                  schedules={schedules}
                  fests={fests}
                  onRefresh={() => loadDashboardData()}
                />
              )}

              {activeTab === "fests" && (
                <div className="p-12 text-center text-slate-500 bg-slate-800/50 rounded-3xl border border-slate-800">
                  <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  Fest Manager Component (To be implemented)
                </div>
              )}
              {activeTab === "gallery" && (
                <div className="p-12 text-center text-slate-500 bg-slate-800/50 rounded-3xl border border-slate-800">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  Gallery Manager Component (To be implemented)
                </div>
              )}
              {activeTab === "feedback" && (
                <div className="p-12 text-center text-slate-500 bg-slate-800/50 rounded-3xl border border-slate-800">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  Feedback Viewer Component (To be implemented)
                </div>
              )}
            </>
          )}

          {/* ACCESS DENIED FALLBACK */}
          {!user?.is_superuser && activeTab !== "events" && (
            <div className="flex flex-col items-center justify-center h-64 bg-red-900/10 border border-red-900/30 rounded-3xl text-red-400">
              <AlertCircle className="w-10 h-10 mb-2" />
              <h3 className="font-bold">Access Restricted</h3>
              <p className="text-sm">
                You do not have permission to view this section.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Sub-component for Sidebar Buttons
const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group ${
      active
        ? "bg-linear-to-r from-cyan-600/20 to-transparent text-cyan-400 border-l-4 border-cyan-500"
        : "text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
    }`}
  >
    <span
      className={`transition-transform group-hover:scale-110 ${
        active ? "text-cyan-400" : "text-slate-500 group-hover:text-white"
      }`}
    >
      {icon}
    </span>
    {label}
  </button>
);

export default AdminDashboard;
