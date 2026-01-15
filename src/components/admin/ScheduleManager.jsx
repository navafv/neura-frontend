import { useState } from "react";
import { Plus, Trash2, Clock, MapPin } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const ScheduleManager = ({ schedules, fests, onRefresh }) => {
  const [newItem, setNewItem] = useState({
    title: "",
    start_time: "",
    location: "",
    description: "",
    fest: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newItem.title || !newItem.fest || !newItem.start_time)
      return toast.error("Required fields missing");

    setLoading(true);
    try {
      await api.post("schedules/", newItem);
      toast.success("Schedule item added!");
      setNewItem({ ...newItem, title: "", location: "", description: "" });
      onRefresh();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule item?")) return;
    try {
      await api.delete(`schedules/${id}/`);
      onRefresh();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Schedule Timeline</h2>
      </div>

      <Card className="bg-slate-800 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-700">
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Title
          </label>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            placeholder="e.g. Inauguration"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Fest
          </label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
            value={newItem.fest}
            onChange={(e) => setNewItem({ ...newItem, fest: e.target.value })}
          >
            <option value="">Select Fest</option>
            {fests.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Time
          </label>
          <input
            type="datetime-local"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
            value={newItem.start_time}
            onChange={(e) =>
              setNewItem({ ...newItem, start_time: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Location
          </label>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
            value={newItem.location}
            onChange={(e) =>
              setNewItem({ ...newItem, location: e.target.value })
            }
            placeholder="Main Stage"
          />
        </div>
        <div className="col-span-2">
          <Button onClick={handleAdd} isLoading={loading} className="w-full">
            <Plus size={18} /> Add to Schedule
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {schedules.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500/30 transition-colors"
          >
            <div className="flex flex-col items-center justify-center w-16 bg-slate-900 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-500">
                {new Date(item.start_time).toLocaleString("default", {
                  month: "short",
                })}
              </span>
              <span className="text-lg font-black text-white">
                {new Date(item.start_time).getDate()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-white">{item.title}</h4>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-600 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex gap-4 text-sm text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock size={14} />{" "}
                  {new Date(item.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {item.location}
                </span>
              </div>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <p className="text-slate-500 text-center">No schedule items found.</p>
        )}
      </div>
    </div>
  );
};
