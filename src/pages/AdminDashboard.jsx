import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Calendar,
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
  X,
  MapPin,
  Users,
  Download,
  Share2,
  CheckCircle,
  Circle,
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
  const [users, setUsers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // --- EVENT MANAGER STATES ---
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // --- SUB-FORMS ---
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [newRoundData, setNewRoundData] = useState({
    name: "",
    selection_limit: 10,
  });

  // --- CRUD FORM STATES ---
  const [isEditing, setIsEditing] = useState(false); // 'event', 'fest', 'edit_event'
  const [editForm, setEditForm] = useState({});

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
      const eventRes = await api.get("events/my_events/");
      setEvents(eventRes.data.results || eventRes.data);

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

  const loadEventStats = async (id) => {
    try {
      const res = await api.get(`events/${id}/dashboard_data/`);
      setEventStats(res.data);
    } catch {
      toast.error("Access Denied to this event");
    }
  };

  // --- GENERIC CRUD HANDLERS ---
  const handleDelete = async (endpoint, id, refreshFn) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`${endpoint}/${id}/`);
      toast.success("Deleted successfully");
      refreshFn();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSaveEvent = async () => {
    const formData = new FormData();
    Object.keys(editForm).forEach((key) => {
      if (editForm[key] !== null) {
        formData.append(key, editForm[key]);
      }
    });

    try {
      if (editForm.id) {
        await api.patch(`events/${editForm.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Event Updated");
      } else {
        await api.post(`events/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Event Created");
      }
      setIsEditing(false);
      loadDashboardData(true);
    } catch {
      toast.error("Save failed. Check fields.");
    }
  };

  const handleCreateFest = async () => {
    try {
      await api.post("fests/", editForm);
      toast.success("Fest Created");
      setIsEditing(false);
      loadDashboardData(true);
    } catch {
      toast.error("Failed");
    }
  };

  // --- ROUND MANAGEMENT ---
  const handleAddRound = async () => {
    try {
      await api.post("rounds/", {
        event: selectedEventId,
        round_number: (eventStats.rounds_config.length || 0) + 1,
        ...newRoundData,
      });
      toast.success("Round Added");
      setShowRoundForm(false);
      loadEventStats(selectedEventId);
    } catch {
      toast.error("Failed to add round");
    }
  };

  const handleDeleteRound = async (roundId) => {
    if (!window.confirm("Delete this round?")) return;
    try {
      await api.delete(`rounds/${roundId}/`);
      toast.success("Round Deleted");
      loadEventStats(selectedEventId);
    } catch {
      toast.error("Delete failed");
    }
  };

  // --- ACTIONS ---
  const handlePublishResults = async () => {
    const ev = events.find((e) => e.id === selectedEventId);
    try {
      await api.patch(`events/${selectedEventId}/`, {
        results_published: !ev.results_published,
      });
      toast.success(
        ev.results_published ? "Results Un-published" : "Results Published!"
      );
      loadDashboardData(true); // reload to get fresh event state
    } catch {
      toast.error("Action failed");
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(
        `events/${selectedEventId}/export_registrations/`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `event_${selectedEventId}_registrations.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  const toggleAttendance = async (pid) => {
    try {
      await api.patch(`participants/${pid}/toggle_attendance/`);
      loadEventStats(selectedEventId);
      toast.success("Attendance Updated");
    } catch {
      toast.error("Failed");
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

  const generateCertificates = async (id) => {
    const tid = toast.loading("Forging Certificates...");
    try {
      const res = await api.post(`events/${id}/generate_certificates/`);
      toast.success(res.data.detail, { id: tid });
    } catch {
      toast.error("Failed to generate", { id: tid });
    }
  };

  if (!user)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-cyan-400 animate-pulse">
        Authenticating...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
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

                {/* EDIT FORM OMITTED FOR BREVITY, SAME AS BEFORE BUT WITH FILE INPUTS */}
                {isEditing === "event" && (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-cyan-500/50 mb-6 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-cyan-400 mb-4">
                      {editForm.id ? "Edit Event" : "Create New Event"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        placeholder="Title"
                        value={editForm.title || ""}
                        className="bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                      />
                      <input
                        type="datetime-local"
                        value={editForm.date || ""}
                        className="bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                      />
                      <input
                        placeholder="Location"
                        value={editForm.location || ""}
                        className="bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                      />
                      <select
                        value={editForm.fest || ""}
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
                      <textarea
                        placeholder="Description"
                        value={editForm.description || ""}
                        className="col-span-1 md:col-span-2 bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2 col-span-2">
                        <label className="text-slate-400 text-sm">
                          Cover Image:{" "}
                          <input
                            type="file"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                image: e.target.files[0],
                              })
                            }
                          />
                        </label>
                        <label className="text-slate-400 text-sm">
                          Rulebook:{" "}
                          <input
                            type="file"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                pdf_resource: e.target.files[0],
                              })
                            }
                          />
                        </label>
                      </div>
                      <label className="flex items-center gap-2 text-slate-400">
                        <input
                          type="checkbox"
                          checked={editForm.is_team_event || false}
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
                        onClick={handleSaveEvent}
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
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditForm({
                                id: ev.id,
                                title: ev.title,
                                date: ev.date.slice(0, 16),
                                description: ev.description,
                                location: ev.location,
                                fest: ev.fest,
                                is_team_event: ev.is_team_event,
                              });
                              setIsEditing("event");
                            }}
                            className="bg-blue-500 text-white p-1 rounded-full"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete("events", ev.id, () =>
                                loadDashboardData(true)
                              )
                            }
                            className="bg-red-500 text-white p-1 rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Event Detail View */}
                {selectedEventId && eventStats ? (
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 animate-in slide-in-from-bottom-4">
                    {/* TOP CONTROLS */}
                    <div className="flex flex-wrap justify-between items-center mb-8 gap-4 pb-6 border-b border-slate-800">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Manage:{" "}
                          {events.find((e) => e.id === selectedEventId)?.title}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {eventStats.total_registrations} Registrations
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handlePublishResults}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                            events.find((e) => e.id === selectedEventId)
                              ?.results_published
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          <Share2 size={14} />{" "}
                          {events.find((e) => e.id === selectedEventId)
                            ?.results_published
                            ? "Results Published"
                            : "Publish Results"}
                        </button>
                        <button
                          onClick={handleExport}
                          className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-700 flex items-center gap-2"
                        >
                          <Download size={14} /> Export CSV
                        </button>
                        <button
                          onClick={() => generateCertificates(selectedEventId)}
                          className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <Zap size={14} /> Certificates
                        </button>
                      </div>
                    </div>

                    {/* ROUND CONFIGURATION */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase">
                          Competition Rounds
                        </h4>
                        <button
                          onClick={() => setShowRoundForm(!showRoundForm)}
                          className="text-cyan-400 text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} />{" "}
                          {showRoundForm ? "Cancel" : "Add Round"}
                        </button>
                      </div>

                      {/* Add Round Form */}
                      {showRoundForm && (
                        <div className="bg-slate-800 p-4 rounded-xl mb-4 flex gap-4 items-end">
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">
                              Round Name
                            </label>
                            <input
                              placeholder="e.g. Final Round"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                              onChange={(e) =>
                                setNewRoundData({
                                  ...newRoundData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="w-32">
                            <label className="text-xs text-slate-500">
                              Selection Limit
                            </label>
                            <input
                              type="number"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                              value={newRoundData.selection_limit}
                              onChange={(e) =>
                                setNewRoundData({
                                  ...newRoundData,
                                  selection_limit: e.target.value,
                                })
                              }
                            />
                          </div>
                          <button
                            onClick={handleAddRound}
                            className="bg-green-600 text-white p-2 rounded-lg"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {eventStats.rounds_config.map((r) => (
                          <div
                            key={r.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                              selectedRound === r.round_number
                                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                                : "bg-slate-800 border-slate-700 text-slate-400"
                            }`}
                            onClick={() => setSelectedRound(r.round_number)}
                          >
                            <span className="font-bold">R{r.round_number}</span>
                            <span className="text-xs opacity-70 truncate max-w-25">
                              {r.name}
                            </span>
                            {user.is_superuser && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRound(r.id);
                                }}
                                className="hover:text-red-400"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        {eventStats.rounds_config.length === 0 && (
                          <span className="text-slate-500 text-sm italic">
                            No rounds configured.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Participants List */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800">
                      <div className="p-4 bg-slate-800 flex justify-between items-center">
                        <h4 className="font-bold text-white">
                          Participants in Round {selectedRound}
                        </h4>
                        <button
                          onClick={handlePromote}
                          className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Promote Selected
                        </button>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                          <tr>
                            <th className="p-4 w-10"></th>
                            <th className="p-4">Participant</th>
                            <th className="p-4">Attendance</th>
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
                                    onChange={() =>
                                      setSelectedParticipants((prev) =>
                                        prev.includes(p.id)
                                          ? prev.filter((x) => x !== p.id)
                                          : [...prev, p.id]
                                      )
                                    }
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-600 checked:bg-cyan-500"
                                  />
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-white">
                                    {p.team_name || p.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {p.team_name ? p.name : p.college}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <button
                                    onClick={() => toggleAttendance(p.id)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                      p.attended
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-red-500/10 text-red-400"
                                    }`}
                                  >
                                    {p.attended ? (
                                      <CheckCircle size={12} />
                                    ) : (
                                      <Circle size={12} />
                                    )}{" "}
                                    {p.attended ? "Present" : "Absent"}
                                  </button>
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

            {/* Fests Tab Content... (omitted as no changes needed here, relies on previous logic) */}
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
                        placeholder="Fest Name"
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
                        onClick={handleCreateFest}
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

            {/* Gallery and Feedback - existing logic works */}
            {activeTab === "gallery" && user.is_superuser && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Gallery Management</h2>
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
                    </div>
                  ))}
                </div>
              </div>
            )}
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
