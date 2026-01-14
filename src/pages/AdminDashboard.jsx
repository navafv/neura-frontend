import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Calendar,
  Image,
  MessageSquare,
  Zap,
  Trophy,
  Crown,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  X,
  Download,
  Share2,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import Auth Hook

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Use logout from context
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
  const [newGalleryImage, setNewGalleryImage] = useState({
    title: "",
    image: null,
  });

  // --- CRUD FORM STATES ---
  const [isEditing, setIsEditing] = useState(false);
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
      logout(); // Sync logout
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

  // --- FORM HANDLING ---
  const startEditEvent = (ev) => {
    setEditForm({
      id: ev.id,
      title: ev.title,
      date: ev.date.slice(0, 16),
      registration_deadline: ev.registration_deadline
        ? ev.registration_deadline.slice(0, 16)
        : "",
      location: ev.location,
      fest: ev.fest,
      description: ev.description,
      registration_fee: ev.registration_fee,
      is_team_event: ev.is_team_event,
      min_team_size: ev.min_team_size,
      max_team_size: ev.max_team_size,
      max_participants: ev.max_participants,
      // Handle array to string for input
      custom_fields: ev.custom_fields ? ev.custom_fields.join(", ") : "",
    });
    setIsEditing("event");
  };

  const handleSaveEvent = async () => {
    const formData = new FormData();
    Object.keys(editForm).forEach((key) => {
      if (key === "custom_fields") {
        // Convert comma separated string to JSON array string
        const fields =
          typeof editForm[key] === "string"
            ? editForm[key]
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
            : editForm[key];
        formData.append(key, JSON.stringify(fields));
      } else if (editForm[key] !== null && editForm[key] !== undefined) {
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
    } catch (err) {
      toast.error("Save failed. Check required fields.");
      console.error(err);
    }
  };

  // --- GENERIC DELETE ---
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

  // --- ROUND & PARTICIPANT ACTIONS ---
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
      loadEventStats(selectedEventId);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handlePublishResults = async () => {
    const ev = events.find((e) => e.id === selectedEventId);
    try {
      await api.patch(`events/${selectedEventId}/`, {
        results_published: !ev.results_published,
      });
      toast.success(
        ev.results_published ? "Results Un-published" : "Results Published!"
      );
      loadDashboardData(true);
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

  // --- GALLERY & FEST ACTIONS ---
  const handleAddGallery = async () => {
    if (!newGalleryImage.title || !newGalleryImage.image)
      return toast.error("Title and Image required");
    const formData = new FormData();
    formData.append("title", newGalleryImage.title);
    formData.append("image", newGalleryImage.image);
    try {
      await api.post("gallery/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image Uploaded");
      setNewGalleryImage({ title: "", image: null });
      loadDashboardData(true);
    } catch {
      toast.error("Upload failed");
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-cyan-400 animate-pulse">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              {user.is_superuser ? (
                <Crown className="text-yellow-400" />
              ) : (
                <Zap className="text-cyan-400" />
              )}
              {user.is_superuser ? "SUPER ADMIN" : "COORDINATOR"}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 font-bold flex items-center gap-2 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR */}
          <aside className="lg:w-64 space-y-2">
            <NavBtn
              id="events"
              label="Events"
              icon={<Calendar />}
              active={activeTab}
              set={setActiveTab}
            />
            {user.is_superuser && (
              <>
                <NavBtn
                  id="fests"
                  label="Fests"
                  icon={<Crown />}
                  active={activeTab}
                  set={setActiveTab}
                />
                <NavBtn
                  id="gallery"
                  label="Gallery"
                  icon={<Image />}
                  active={activeTab}
                  set={setActiveTab}
                />
                <NavBtn
                  id="feedback"
                  label="Feedback"
                  icon={<MessageSquare />}
                  active={activeTab}
                  set={setActiveTab}
                />
              </>
            )}
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 bg-slate-800/50 border border-slate-700 rounded-[2.5rem] p-8 min-h-150 backdrop-blur-sm relative">
            {/* EVENTS TAB (Truncated for brevity, logic remains same as original but uses new editForm logic above) */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Events</h2>
                  {user.is_superuser && (
                    <button
                      onClick={() => {
                        setEditForm({});
                        setIsEditing("event");
                      }}
                      className="bg-cyan-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-cyan-500 transition-all"
                    >
                      <Plus size={16} /> New Event
                    </button>
                  )}
                </div>

                {/* CREATE/EDIT EVENT FORM */}
                {isEditing === "event" && (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-cyan-500/50 mb-6 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-cyan-400 mb-4">
                      {editForm.id ? "Edit Event" : "Create New Event"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Basic Fields */}
                      <input
                        placeholder="Title"
                        value={editForm.title || ""}
                        className="bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 block mb-1">
                            Event Date
                          </label>
                          <input
                            type="datetime-local"
                            value={editForm.date || ""}
                            className="w-full bg-slate-800 p-3 rounded-lg text-white"
                            onChange={(e) =>
                              setEditForm({ ...editForm, date: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 block mb-1">
                            Deadline
                          </label>
                          <input
                            type="datetime-local"
                            value={editForm.registration_deadline || ""}
                            className="w-full bg-slate-800 p-3 rounded-lg text-white"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                registration_deadline: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

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

                      {/* Payment Fields */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 col-span-2 md:col-span-1">
                        <label className="text-xs text-cyan-400 font-bold block mb-2">
                          Payment Settings
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="number"
                            placeholder="Fee (0 for Free)"
                            value={editForm.registration_fee || 0}
                            className="bg-slate-700 p-2 rounded text-white w-24"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                registration_fee: e.target.value,
                              })
                            }
                          />
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 block">
                              Payment QR
                            </label>
                            <input
                              type="file"
                              className="text-xs"
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  payment_qr: e.target.files[0],
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Team Size */}
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 col-span-2 md:col-span-1">
                        <label className="text-xs text-cyan-400 font-bold block mb-2">
                          Team Size (Min-Max)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editForm.min_team_size || 1}
                            className="bg-slate-700 p-2 rounded w-16 text-white"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                min_team_size: e.target.value,
                              })
                            }
                          />
                          <span className="text-white self-center">-</span>
                          <input
                            type="number"
                            value={editForm.max_team_size || 1}
                            className="bg-slate-700 p-2 rounded w-16 text-white"
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                max_team_size: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Description & Custom Fields */}
                      <textarea
                        placeholder="Description"
                        value={editForm.description || ""}
                        className="col-span-2 bg-slate-800 p-3 rounded-lg text-white h-24"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                      />
                      <input
                        placeholder="Custom Fields (e.g. GitHub, Diet - comma separated)"
                        value={editForm.custom_fields || ""}
                        className="col-span-2 bg-slate-800 p-3 rounded-lg text-white"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            custom_fields: e.target.value,
                          })
                        }
                      />

                      {/* File Uploads */}
                      <div className="col-span-2 flex gap-4">
                        <label className="text-sm text-slate-400">
                          Cover:{" "}
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
                        <label className="text-sm text-slate-400">
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
                        Team Event
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEvent}
                        className="bg-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-500"
                      >
                        Save Event
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* EVENT LIST & EVENT DETAILS (Identical to original file, structure preserved) */}
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
                            onClick={() => startEditEvent(ev)}
                            className="bg-blue-500 text-white p-1 rounded-full hover:scale-110 transition-transform"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete("events", ev.id, () =>
                                loadDashboardData(true)
                              )
                            }
                            className="bg-red-500 text-white p-1 rounded-full hover:scale-110 transition-transform"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* DETAILS PANEL (Same as original but includes logic for rounds/participants) */}
                {selectedEventId && eventStats && (
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                    {/* Event Controls */}
                    <div className="flex flex-wrap justify-between items-center mb-8 gap-4 pb-6 border-b border-slate-800">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {events.find((e) => e.id === selectedEventId)?.title}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {events.find((e) => e.id === selectedEventId)
                            ?.registration_fee > 0
                            ? `Paid (₹${
                                events.find((e) => e.id === selectedEventId)
                                  ?.registration_fee
                              })`
                            : "Free"}{" "}
                          • {eventStats.total_registrations} Registrations
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleExport}
                          className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 hover:bg-slate-700"
                        >
                          <Download size={14} /> Export
                        </button>
                        <button
                          onClick={handlePublishResults}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                            events.find((e) => e.id === selectedEventId)
                              ?.results_published
                              ? "text-yellow-400 border-yellow-500 bg-yellow-500/10"
                              : "text-slate-400 border-slate-700 bg-slate-800"
                          }`}
                        >
                          <Share2 size={14} />{" "}
                          {events.find((e) => e.id === selectedEventId)
                            ?.results_published
                            ? "Published"
                            : "Publish Results"}
                        </button>
                        <button
                          onClick={() => generateCertificates(selectedEventId)}
                          className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <Zap size={14} /> Certificates
                        </button>
                      </div>
                    </div>

                    {/* Round Management */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase">
                          Competition Rounds
                        </h4>
                        <button
                          onClick={() => setShowRoundForm(!showRoundForm)}
                          className="text-cyan-400 text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} /> Add Round
                        </button>
                      </div>

                      {showRoundForm && (
                        <div className="bg-slate-800 p-4 rounded-xl mb-4 flex gap-4 items-end animate-in slide-in-from-top-2">
                          <div className="flex-1">
                            <label className="text-xs text-slate-500">
                              Round Name
                            </label>
                            <input
                              placeholder="e.g. Finals"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                              onChange={(e) =>
                                setNewRoundData({
                                  ...newRoundData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="w-24">
                            <label className="text-xs text-slate-500">
                              Selection
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
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-500"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {eventStats.rounds_config.map((r) => (
                          <div
                            key={r.id}
                            className={`px-4 py-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                              selectedRound === r.round_number
                                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                                : "bg-slate-800 border-slate-700 text-slate-400"
                            }`}
                            onClick={() => setSelectedRound(r.round_number)}
                          >
                            <span className="font-bold">R{r.round_number}</span>
                            <span className="text-xs">{r.name}</span>
                            {user.is_superuser && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRound(r.id);
                                }}
                                className="ml-2 hover:text-red-400 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participants Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-800">
                      <div className="p-4 bg-slate-800 flex justify-between items-center">
                        <h4 className="font-bold text-white">
                          Participants (Round {selectedRound})
                        </h4>
                        <button
                          onClick={handlePromote}
                          className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-lg shadow-green-500/20"
                        >
                          Promote Selected
                        </button>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                          <tr>
                            <th className="p-4 w-10"></th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Payment</th>
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
                                    {p.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {p.team_name || p.college}
                                  </div>
                                </td>
                                <td className="p-4">
                                  {p.payment_proof ? (
                                    <a
                                      href={p.payment_proof}
                                      target="_blank"
                                      className="text-cyan-400 flex items-center gap-1 hover:underline"
                                    >
                                      <CreditCard size={14} /> View
                                    </a>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <button
                                    onClick={() => toggleAttendance(p.id)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                      p.attended
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-red-500/10 text-red-400"
                                    }`}
                                  >
                                    {p.attended ? "Present" : "Absent"}
                                  </button>
                                </td>
                                <td className="p-4">
                                  {p.is_winner ? (
                                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                                      <Trophy size={14} /> Winner
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">
                                      Active
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
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OTHER TABS (Gallery, Fests, Feedback - Identical to original) */}
            {activeTab === "gallery" && user.is_superuser && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Gallery Management</h2>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 mb-8 flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">
                      Title
                    </label>
                    <input
                      className="w-full bg-slate-800 p-3 rounded-lg text-white"
                      value={newGalleryImage.title}
                      onChange={(e) =>
                        setNewGalleryImage({
                          ...newGalleryImage,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">
                      Image
                    </label>
                    <input
                      type="file"
                      className="text-sm text-slate-400"
                      onChange={(e) =>
                        setNewGalleryImage({
                          ...newGalleryImage,
                          image: e.target.files[0],
                        })
                      }
                    />
                  </div>
                  <button
                    onClick={handleAddGallery}
                    className="bg-cyan-600 px-6 py-3 rounded-xl font-bold hover:bg-cyan-500 transition-colors"
                  >
                    Upload
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden aspect-video border border-slate-800"
                    >
                      <img
                        src={img.image}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <button
                        onClick={() =>
                          handleDelete("gallery", img.id, () =>
                            loadDashboardData(true)
                          )
                        }
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="absolute bottom-0 w-full bg-black/70 p-2 text-xs truncate text-center text-slate-200">
                        {img.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "fests" && user.is_superuser && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Fest Management</h2>
                  <button
                    onClick={() => {
                      setEditForm({});
                      setIsEditing("fest");
                    }}
                    className="bg-cyan-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-cyan-500"
                  >
                    + Add Fest
                  </button>
                </div>
                {isEditing === "fest" && (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-cyan-500/50 mb-6 animate-in slide-in-from-top-2">
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
                          className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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

// Sidebar Button Component
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
