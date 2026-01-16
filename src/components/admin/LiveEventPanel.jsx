import { useState } from "react";
import {
  CheckCircle,
  X,
  Trophy,
  CreditCard,
  UserCheck,
  UserX,
  Download,
  Award,
  BarChart3,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { QRScanner } from "./QRScanner";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const LiveEventPanel = ({
  event,
  stats,
  onAddRound,
  onDeleteRound,
  onPromote,
  onToggleAttendance,
  onRank,
  user,
  onRefresh,
}) => {
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [roundForm, setRoundForm] = useState(false);
  const [newRound, setNewRound] = useState({ name: "", limit: 10 });
  const [viewAnalytics, setViewAnalytics] = useState(false);
  const [generating, setGenerating] = useState(false);

  const currentParticipants = stats.participants.filter(
    (p) => p.current_round === selectedRound
  );

  const handleSelect = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    try {
      const response = await api.get(
        `events/${event.id}/export_registrations/`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${event.title}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  const handleGenerateCertificates = async () => {
    if (
      !confirm("Generate certificates for all attendees? This may take time.")
    )
      return;
    setGenerating(true);
    try {
      const res = await api.post(`events/${event.id}/generate_certificates/`);
      toast.success(res.data.detail);
      onRefresh();
    } catch {
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  // Helper to fix media URLs (if they are missing domain)
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-800/50 p-4 rounded-3xl border border-slate-700">
        <h3 className="font-bold text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Live Control
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewAnalytics(!viewAnalytics)}
            className="py-2 text-xs"
          >
            <BarChart3 size={16} /> Analytics
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="py-2 text-xs"
          >
            <Download size={16} /> CSV
          </Button>
          <Button
            variant="primary"
            isLoading={generating}
            onClick={handleGenerateCertificates}
            className="py-2 text-xs bg-yellow-600 hover:bg-yellow-500"
          >
            <Award size={16} /> Generate Certs
          </Button>
        </div>
      </div>

      {/* QR Scanner */}
      <QRScanner onScanSuccess={onRefresh} />

      {/* Analytics Panel */}
      {viewAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
          <StatBox label="Total" value={stats.total_registrations} />
          <StatBox
            label="Attended"
            value={stats.participants.filter((p) => p.attended).length}
          />
          <StatBox
            label="Revenue"
            value={`₹${stats.total_registrations * event.registration_fee}`}
          />
          <StatBox label="Rounds" value={stats.rounds_config.length} />
        </div>
      )}

      {/* Round Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {stats.rounds_config.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRound(r.round_number)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              selectedRound === r.round_number
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Round {r.round_number}
            {user.is_superuser && (
              <X
                size={12}
                className="hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRound(r.id);
                }}
              />
            )}
          </button>
        ))}
        <Button
          variant="ghost"
          className="rounded-full px-4"
          onClick={() => setRoundForm(!roundForm)}
        >
          + Add Round
        </Button>
      </div>

      {/* Add Round Form */}
      {roundForm && (
        <Card className="flex items-end gap-4 p-4 bg-slate-800">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Round Name
            </label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
              placeholder="e.g. Coding Finals"
              onChange={(e) =>
                setNewRound({ ...newRound, name: e.target.value })
              }
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Limit
            </label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
              value={newRound.limit}
              onChange={(e) =>
                setNewRound({ ...newRound, limit: e.target.value })
              }
            />
          </div>
          <Button
            onClick={() => {
              onAddRound(newRound);
              setRoundForm(false);
            }}
          >
            Save
          </Button>
        </Card>
      )}

      {/* Participants Table */}
      <Card className="p-0 overflow-hidden border-slate-700">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-bold text-white">
            Qualifier List (Round {selectedRound})
          </h3>
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="py-2 text-xs"
              onClick={() => onPromote(selectedParticipants, selectedRound + 1)}
            >
              Promote Selected ({selectedParticipants.length})
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4 w-10">Select</th>
                <th className="p-4">Participant</th>
                <th className="p-4">Status</th>
                <th className="p-4">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {currentParticipants.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-700/20 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(p.id)}
                      onChange={() => handleSelect(p.id)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-800 checked:bg-cyan-500 transition-all"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-base">
                      {p.name}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {p.team_name || p.college}
                    </div>
                    {p.payment_proof && (
                      <a
                        href={getFullUrl(p.payment_proof)}
                        target="_blank"
                        className="text-cyan-400 text-xs flex items-center gap-1 mt-1 hover:underline"
                      >
                        <CreditCard size={10} /> Proof
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onToggleAttendance(p.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        p.attended
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {p.attended ? (
                        <UserCheck size={14} />
                      ) : (
                        <UserX size={14} />
                      )}{" "}
                      {p.attended ? "Present" : "Absent"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {[1, 2, 3].map((rank) => (
                        <button
                          key={rank}
                          onClick={() => onRank(p.id, rank)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                            p.rank === rank
                              ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-110"
                              : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                          }`}
                        >
                          {rank}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {currentParticipants.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-slate-500 italic"
                  >
                    No participants in this round.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center">
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </div>
  </div>
);
