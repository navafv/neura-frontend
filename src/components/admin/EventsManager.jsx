import { Edit3, Trash2, Plus, Download, Share2, Zap } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export const EventsManager = ({
  events,
  selectedEventId,
  onSelectEvent,
  onEdit,
  onDelete,
  onCreate,
  user,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Event Control
        </h2>
        {user.is_superuser && (
          <Button onClick={onCreate}>
            <Plus size={18} /> Create Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <div key={ev.id} className="relative group">
            <button
              onClick={() => onSelectEvent(ev.id)}
              className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 ${
                selectedEventId === ev.id
                  ? "bg-cyan-600/10 border-cyan-500 ring-2 ring-cyan-500/20"
                  : "bg-slate-800 border-slate-700 hover:border-slate-600"
              }`}
            >
              <h4
                className={`font-bold text-lg mb-1 ${
                  selectedEventId === ev.id ? "text-cyan-400" : "text-white"
                }`}
              >
                {ev.title}
              </h4>
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium px-2 py-1 rounded-lg bg-slate-900/50 text-slate-400">
                  {new Date(ev.date).toLocaleDateString()}
                </span>
                {selectedEventId === ev.id && (
                  <Zap size={16} className="text-cyan-400 animate-pulse" />
                )}
              </div>
            </button>

            {user.is_superuser && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(ev);
                  }}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(ev.id);
                  }}
                  className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
