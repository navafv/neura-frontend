import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Users, Trophy, ChevronRight } from "lucide-react";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  useEffect(() => {
    api.get("events/").then((res) => setEvents(res.data.results || res.data));
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      api.get(`events/${selectedEventId}/admin_stats/`).then((res) => {
        setEventData(res.data);
      });
    }
  }, [selectedEventId]);

  const handlePromote = async () => {
    if (selectedParticipants.length === 0)
      return toast.error("Select participants first");
    try {
      await api.post("participants/promote/", {
        ids: selectedParticipants,
        next_round: selectedRound + 1,
      });
      toast.success("Promoted successfully!");
      // Refresh data
      const res = await api.get(`events/${selectedEventId}/admin_stats/`);
      setEventData(res.data);
      setSelectedParticipants([]);
    } catch {
      toast.error("Failed to promote");
    }
  };

  const handleRank = async (id, rank) => {
    try {
      await api.patch(`participants/${id}/assign_rank/`, { rank });
      toast.success(`Rank ${rank} assigned!`);
    } catch {
      toast.error("Failed");
    }
  };

  const toggleSelect = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <h1 className="text-3xl font-black mb-8">
        Admin <span className="text-cyan-400">Control</span>
      </h1>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar: Event List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-slate-500 font-bold uppercase text-xs">Events</h3>
          {events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedEventId === ev.id
                  ? "bg-cyan-600 border-cyan-500"
                  : "bg-slate-800 border-slate-700 hover:border-slate-500"
              }`}
            >
              {ev.title}
            </button>
          ))}
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-3xl p-8 min-h-125">
          {eventData ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {eventData.participants.length} Registrations
                </h2>
                <div className="flex gap-2">
                  {/* Round Selector */}
                  {[1, 2, 3].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRound(r)}
                      className={`px-4 py-2 rounded-lg font-bold ${
                        selectedRound === r
                          ? "bg-cyan-500 text-black"
                          : "bg-slate-700"
                      }`}
                    >
                      Round {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-slate-800 p-4 rounded-xl mb-6 flex justify-between items-center border border-slate-700">
                <span className="text-slate-400">
                  {selectedParticipants.length} selected
                </span>
                <button
                  onClick={handlePromote}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  Promote to Round {selectedRound + 1}{" "}
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="p-4">Select</th>
                      <th className="p-4">Name/Team</th>
                      <th className="p-4">Round</th>
                      <th className="p-4">Rank Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventData.participants
                      .filter((p) => p.current_round === selectedRound)
                      .map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-slate-700 hover:bg-slate-700/30"
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded bg-slate-900 border-slate-600"
                              checked={selectedParticipants.includes(p.id)}
                              onChange={() => toggleSelect(p.id)}
                            />
                          </td>
                          <td className="p-4 font-bold">
                            {p.team_name ? (
                              <span className="text-cyan-400">
                                {p.team_name}
                              </span>
                            ) : (
                              p.name
                            )}
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-700 px-2 py-1 rounded text-xs">
                              R{p.current_round}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2">
                            <button
                              onClick={() => handleRank(p.id, 1)}
                              className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded transition-all"
                            >
                              <Trophy size={14} />
                            </button>
                            <button
                              onClick={() => handleRank(p.id, 2)}
                              className="p-2 bg-slate-400/10 text-slate-400 hover:bg-slate-400 hover:text-black rounded transition-all"
                            >
                              2
                            </button>
                            <button
                              onClick={() => handleRank(p.id, 3)}
                              className="p-2 bg-orange-700/10 text-orange-700 hover:bg-orange-700 hover:text-black rounded transition-all"
                            >
                              3
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {eventData.participants.filter(
                  (p) => p.current_round === selectedRound
                ).length === 0 && (
                  <p className="text-center text-slate-500 py-10">
                    No participants in Round {selectedRound}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Select an event to manage
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
