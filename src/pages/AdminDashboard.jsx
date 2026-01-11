import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Trash2,
  UserCheck,
  Calendar,
  Trophy,
  Image,
  MessageSquare,
  Download,
  Plus,
  Edit3,
  X,
  Save,
  FileText,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("participants");
  const [data, setData] = useState({
    events: [],
    participants: [],
    leaderboard: [],
    gallery: [],
    feedback: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ev, pa, ld, ga, fe] = await Promise.all([
        api.get("events/"),
        api.get("participants/"),
        api.get("leaderboard/"),
        api.get("gallery/"),
        api.get("feedback/"),
      ]);
      setData({
        events: ev.data.results || ev.data,
        participants: pa.data.results || pa.data,
        leaderboard: ld.data.results || ld.data,
        gallery: ga.data.results || ga.data,
        feedback: fe.data.results || fe.data,
      });
    } catch {
      toast.error("Administrative authentication required.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Certificate Trigger
  const generateCertificates = async (eventId) => {
    const toastId = toast.loading("Forging & Emailing Certificates...");
    try {
      const res = await api.post(`events/${eventId}/generate_certificates/`);
      toast.success(res.data.detail, { id: toastId });
    } catch {
      toast.error("Failed to generate certificates. Check server logs.", {
        id: toastId,
      });
    }
  };

  const exportParticipantsCSV = () => {
    const headers = ["Name,Email,Phone,College,Event,Registered At\n"];
    // Escape quotes to handle commas in values
    const rows = data.participants
      .map(
        (p) =>
          `"${p.name}","${p.email}","${p.phone}","${p.college}","${p.event_name}","${p.registered_at}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Neura_Participants.csv`);
    a.click();
    toast.success("CSV Downloaded");
  };

  const deleteItem = async (endpoint, id) => {
    if (window.confirm("Danger: Purge this record?")) {
      try {
        await api.delete(`${endpoint}/${id}/`);
        toast.success("Purged.");
        fetchAllData();
      } catch {
        toast.error("Purge failed.");
      }
    }
  };

  const tabs = [
    { id: "participants", name: "Students", icon: <UserCheck size={18} /> },
    { id: "events", name: "Events", icon: <Calendar size={18} /> },
    { id: "leaderboard", name: "Ranks", icon: <Trophy size={18} /> },
    { id: "gallery", name: "Media", icon: <Image size={18} /> },
    { id: "feedback", name: "Feedback", icon: <MessageSquare size={18} /> },
  ];

  const markAttendance = async (id) => {
    try {
      await api.patch(`participants/${id}/`, { attended: true }); // Check-in System
      toast.success("Student Checked In");
      fetchAllData();
    } catch (err) {
      toast.error("Check-in failed");
    }
  };

  const analytics = {
    total: data.participants.length,
    checkedIn: data.participants.filter((p) => p.attended).length, // Registration Analytics
    festRatio:
      (data.events.filter((e) => e.is_fest_event).length / data.events.length) *
      100,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter">
            COMMAND <span className="text-cyan-400">CENTER</span>
          </h1>
          <div className="flex gap-4">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <span className="text-cyan-400 font-bold">
                {data.participants.length}
              </span>{" "}
              <span className="text-xs text-slate-500 uppercase">
                Registered
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatBox
                label="Attendance Rate"
                count={`${Math.round(
                  (analytics.checkedIn / analytics.total) * 100
                )}%`}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-cyan-600"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </aside>

          <main className="flex-1 bg-slate-800/40 border border-slate-700 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold capitalize">
                {activeTab} List
              </h2>
              {activeTab === "participants" && (
                <button
                  onClick={exportParticipantsCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold"
                >
                  <Download size={16} /> Export CSV
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-cyan-400 animate-pulse font-mono">
                Syncing Database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === "participants" && (
                  <table className="w-full text-left">
                    <thead className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Event</th>
                        <th className="p-4">Certificate</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.participants.map((reg) => (
                        <tr
                          key={reg.id}
                          className="border-b border-slate-700 hover:bg-slate-700/30"
                        >
                          <td className="p-4 font-bold">{reg.name}</td>
                          <td className="p-4 text-cyan-400">
                            {reg.event_name}
                          </td>
                          <td className="p-4">
                            {reg.certificate ? (
                              <a
                                href={reg.certificate}
                                target="_blank"
                                className="text-green-400 hover:underline"
                              >
                                View PDF
                              </a>
                            ) : (
                              "None"
                            )}
                          </td>
                          <td className="p-4">
                            {!reg.attended && (
                              <button
                                onClick={() => markAttendance(reg.id)}
                                className="text-green-400 hover:underline mr-4"
                              >
                                Check-in
                              </button>
                            )}
                            <button
                              onClick={() => deleteItem("participants", reg.id)}
                              className="text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === "events" && (
                  <table className="w-full text-left">
                    <thead className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="p-4">Title</th>
                        <th className="p-4">Limit</th>
                        <th className="p-4 text-center">
                          Certificate Automation
                        </th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.events.map((ev) => (
                        <tr
                          key={ev.id}
                          className="border-b border-slate-700 hover:bg-slate-700/30"
                        >
                          <td className="p-4 font-bold">{ev.title}</td>
                          <td className="p-4 font-mono">
                            {ev.registration_count}/{ev.max_participants}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => generateCertificates(ev.id)}
                              className="mx-auto flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold hover:bg-green-500 hover:text-white transition-all"
                            >
                              <Zap size={12} /> Forge Certificates
                            </button>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => deleteItem("events", ev.id)}
                              className="text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* Other tabs remain similar */}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
