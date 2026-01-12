import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Calendar,
  UserCheck,
  Image,
  MessageSquare,
  Zap,
  Trophy,
  ChevronRight,
  Crown,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("events");
  const [loading, setLoading] = useState(true);

  // --- DATA STATES ---
  const [events, setEvents] = useState([]);
  const [fests, setFests] = useState([]);
  const [users, setUsers] = useState([]); // For assigning coordinators
  const [gallery, setGallery] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // --- EVENT MANAGER STATES ---
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // --- CRUD FORM STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({}); // Generic form state for creates/edits

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const res = await api.get("user/me/");
      setUser(res.data);
      loadDashboardData(res.data.is_superuser);
    } catch {
      toast.error("Session expired");
      navigate("/login");
    }
  };

  const loadDashboardData = async (isSuperUser) => {
    setLoading(true);
    try {
      // 1. Fetch Events (Filtered by Backend based on role)
      const eventRes = await api.get("events/my_events/");
      setEvents(eventRes.data.results || eventRes.data);

      // 2. Fetch Admin-Only Data
      if (isSuperUser) {
        const [userRes, festRes, galRes, feedRes] = await Promise.all([
          api.get("users/"),
          api.get("fests/"),
          api.get("gallery/"),
          api.get("feedback/"),
        ]);
        setUsers(userRes.data.results || userRes.data);
        setFests(festRes.data.results || festRes.data);
        setGallery(galRes.data.results || galRes.data);
        setFeedback(feedRes.data.results || feedRes.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // --- GENERIC CRUD HANDLERS ---

  const handleDelete = async (endpoint, id, refreshFn) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`${endpoint}/${id}/`);
      toast.success("Deleted successfully");
      refreshFn(); // Reload data
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleCreate = async (endpoint, data, refreshFn) => {
    try {
      await api.post(`${endpoint}/`, data);
      toast.success("Created successfully");
      setIsEditing(false);
      refreshFn();
    } catch {
      toast.error("Creation failed");
    }
  };

  // --- EVENT SPECIFIC ACTIONS ---

  const assignCoordinator = async (eventId, userId) => {
    try {
      await api.patch(`events/${eventId}/`, { coordinator: userId });
      toast.success("Coordinator Assigned");
      loadDashboardData(true);
    } catch {
      toast.error("Assignment Failed");
    }
  };

  const handlePromote = async () => {
    if (!selectedParticipants.length)
      return toast.error("Select students first");
    try {
      await api.post("participants/promote/", {
        ids: selectedParticipants,
        next_round: selectedRound + 1,
      });
      toast.success("Promoted!");
      loadEventStats(selectedEventId);
      setSelectedParticipants([]);
    } catch {
      toast.error("Error promoting");
    }
  };

  const handleRank = async (id, rank) => {
    try {
      await api.patch(`participants/${id}/assign_rank/`, { rank });
      toast.success(`Rank ${rank} assigned`);
      loadEventStats(selectedEventId);
    } catch {
      toast.error("Error ranking");
    }
  };

  const loadEventStats = async (id) => {
    try {
      const res = await api.get(`events/${id}/dashboard_data/`);
      setEventStats(res.data);
    } catch {
      toast.error("Access Denied to this event");
    }
  };

  const generateCertificates = async (id) => {
    const tid = toast.loading("Forging Certificates...");
    try {
      const res = await api.post(`events/${id}/generate_certificates/`);
      toast.success(res.data.detail, { id: tid });
    } catch {
      toast.error("Failed to generate", { id: tid });
    }
  };

  // --- RENDER HELPERS ---

  if (!user)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-cyan-400 animate-pulse">
        Authenticating...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              {user.is_superuser ? (
                <Crown className="text-yellow-400" />
              ) : (
                <Zap className="text-cyan-400" />
              )}
              {user.is_superuser
                ? "SUPER ADMIN PANEL"
                : "COORDINATOR DASHBOARD"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Logged in as{" "}
              <span className="text-white font-bold">{user.username}</span>
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              navigate("/login");
            }}
            className="bg-red-500/10 text-red-400 px-5 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-bold mt-4 md:mt-0"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="lg:w-64 space-y-2">
            <NavBtn
              id="events"
              label={user.is_superuser ? "All Events" : "My Events"}
              icon={<Calendar size={18} />}
              active={activeTab}
              set={setActiveTab}
            />

            {user.is_superuser && (
              <div className="pt-4 space-y-2 animate-in fade-in">
                <p className="text-xs font-bold text-slate-500 px-4 mb-2 uppercase tracking-widest">
                  Main Admin
                </p>
                <NavBtn
                  id="fests"
                  label="Manage Fests"
                  icon={<Crown size={18} />}
                  active={activeTab}
                  set={setActiveTab}
                />
                <NavBtn
                  id="gallery"
                  label="Gallery"
                  icon={<Image size={18} />}
                  active={activeTab}
                  set={setActiveTab}
                />
                <NavBtn
                  id="feedback"
                  label="Feedback"
                  icon={<MessageSquare size={18} />}
                  active={activeTab}
                  set={setActiveTab}
                />
              </div>
            )}
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 bg-slate-800/50 border border-slate-700 rounded-[2.5rem] p-8 min-h-150 backdrop-blur-sm relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-[2.5rem] z-10 text-cyan-400">
                Loading...
              </div>
            )}

            {/* --- EVENTS TAB --- */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Event Management</h2>
                  {user.is_superuser && (
                    <button
                      onClick={() => {
                        setEditForm({});
                        setIsEditing("event");
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
                    >
                      <Plus size={16} /> New Event
                    </button>
                  )}
                </div>

                {/* CREATE EVENT FORM (Admin Only) */}
                {isEditing === "event" && (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-cyan-500/50 mb-6 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-cyan-400 mb-4">
                      Create New Event
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        placeholder="Title"
                        className="bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                      />
                      <input
                        type="datetime-local"
                        className="bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                      />
                      <textarea
                        placeholder="Description"
                        className="col-span-2 bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                      />
                      <select
                        className="bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({ ...editForm, fest: e.target.value })
                        }
                      >
                        <option value="">Select Fest</option>
                        {fests.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-slate-400">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              is_team_event: e.target.checked,
                            })
                          }
                        />{" "}
                        Is Team Event?
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleCreate("events", editForm, () =>
                            loadDashboardData(true)
                          )
                        }
                        className="bg-green-600 px-4 py-2 rounded-lg font-bold"
                      >
                        Save Event
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-slate-700 px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Event Selector */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {events.map((ev) => (
                    <div key={ev.id} className="relative group">
                      <button
                        onClick={() => {
                          setSelectedEventId(ev.id);
                          loadEventStats(ev.id);
                        }}
                        className={`whitespace-nowrap px-6 py-4 rounded-2xl border font-bold transition-all shadow-md ${
                          selectedEventId === ev.id
                            ? "bg-cyan-500 text-slate-900 border-cyan-500 scale-105"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        {ev.title}
                      </button>
                      {user.is_superuser && (
                        <button
                          onClick={() =>
                            handleDelete("events", ev.id, () =>
                              loadDashboardData(true)
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Event Detail View */}
                {selectedEventId && eventStats ? (
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 animate-in slide-in-from-bottom-4">
                    {/* Admin: Assign Coordinator */}
                    {user.is_superuser && (
                      <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl flex flex-wrap items-center gap-4 border border-slate-700">
                        <span className="text-sm font-bold text-slate-400 uppercase">
                          Coordinator:
                        </span>
                        <div className="flex-1 text-white font-mono">
                          {events.find((e) => e.id === selectedEventId)
                            ?.coordinator_name || "Unassigned"}
                        </div>
                        <select
                          className="bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-white outline-none focus:border-cyan-500"
                          onChange={(e) =>
                            assignCoordinator(selectedEventId, e.target.value)
                          }
                        >
                          <option value="">Assign User</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Round & Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            onClick={() => setSelectedRound(r)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all ${
                              selectedRound === r
                                ? "bg-cyan-500 text-slate-900 scale-110"
                                : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => generateCertificates(selectedEventId)}
                          className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <Zap size={14} /> Certificates
                        </button>
                        <button
                          onClick={handlePromote}
                          className="bg-green-500 text-slate-900 px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-400 transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                        >
                          Promote Selected <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Participants List */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400 uppercase font-bold text-xs">
                          <tr>
                            <th className="p-4 w-10"></th>
                            <th className="p-4">Participant</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Rank</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                          {eventStats.participants
                            .filter((p) => p.current_round === selectedRound)
                            .map((p) => (
                              <tr
                                key={p.id}
                                className="hover:bg-slate-800/50 transition-colors"
                              >
                                <td className="p-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedParticipants.includes(
                                      p.id
                                    )}
                                    onChange={() => {
                                      setSelectedParticipants((prev) =>
                                        prev.includes(p.id)
                                          ? prev.filter((x) => x !== p.id)
                                          : [...prev, p.id]
                                      );
                                    }}
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-600 checked:bg-cyan-500"
                                  />
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-white">
                                    {p.team_name || p.name}
                                  </div>
                                  {p.team_name && (
                                    <div className="text-xs text-slate-500">
                                      {p.name}
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  {p.is_winner ? (
                                    <span className="text-yellow-400 flex items-center gap-1 font-bold">
                                      <Trophy size={14} /> Winner
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">
                                      In Progress
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 flex gap-2">
                                  {[1, 2, 3].map((r) => (
                                    <button
                                      key={r}
                                      onClick={() => handleRank(p.id, r)}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                                        p.rank === r
                                          ? "bg-yellow-500 text-black shadow-[0_0_10px_#eab308]"
                                          : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                                      }`}
                                    >
                                      {r}
                                    </button>
                                  ))}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {eventStats.participants.filter(
                        (p) => p.current_round === selectedRound
                      ).length === 0 && (
                        <div className="text-center p-12 text-slate-500">
                          No participants found in Round {selectedRound}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 mt-20 border-2 border-dashed border-slate-700 rounded-3xl p-10">
                    Select an event from above to manage
                  </div>
                )}
              </div>
            )}

            {/* --- FESTS TAB (Admin Only) --- */}
            {activeTab === "fests" && user.is_superuser && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Fest Management</h2>
                  <button
                    onClick={() => {
                      setEditForm({});
                      setIsEditing("fest");
                    }}
                    className="bg-cyan-600 px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    + Add Fest
                  </button>
                </div>

                {isEditing === "fest" && (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-cyan-500/50 mb-6">
                    <div className="flex gap-4 mb-4">
                      <input
                        placeholder="Fest Name (e.g. TechNova)"
                        className="bg-slate-800 p-3 rounded-lg text-white flex-1"
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Year"
                        className="bg-slate-800 p-3 rounded-lg text-white w-32"
                        onChange={(e) =>
                          setEditForm({ ...editForm, year: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleCreate("fests", editForm, () =>
                            loadDashboardData(true)
                          )
                        }
                        className="bg-green-600 px-4 py-2 rounded-lg font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-slate-700 px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  {fests.map((f) => (
                    <div
                      key={f.id}
                      className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {f.name}
                        </h3>
                        <p className="text-slate-400">Year: {f.year}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                            f.is_active
                              ? "bg-green-500/10 text-green-400"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {f.is_active ? "Active" : "Archived"}
                        </span>
                        <button
                          onClick={() =>
                            handleDelete("fests", f.id, () =>
                              loadDashboardData(true)
                            )
                          }
                          className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- GALLERY TAB (Admin Only) --- */}
            {activeTab === "gallery" && user.is_superuser && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Gallery Management</h2>
                {/* Upload Section could go here */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden aspect-video"
                    >
                      <img
                        src={img.image}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          handleDelete("gallery", img.id, () =>
                            loadDashboardData(true)
                          )
                        }
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs truncate">
                        {img.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- FEEDBACK TAB (Admin Only) --- */}
            {activeTab === "feedback" && user.is_superuser && (
              <div>
                <h2 className="text-2xl font-bold mb-6">User Feedback</h2>
                <div className="space-y-4">
                  {feedback.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-slate-900 p-6 rounded-2xl border border-slate-700"
                    >
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold text-cyan-400">{msg.name}</h4>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">
                        {msg.message}
                      </p>
                      <div className="text-xs text-slate-500">{msg.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const NavBtn = ({ id, label, icon, active, set }) => (
  <button
    onClick={() => set(id)}
    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
      active === id
        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`}
  >
    {icon} {label}
  </button>
);

export default AdminDashboard;
