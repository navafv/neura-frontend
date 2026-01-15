import { MessageSquare, Star, Trash2 } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const FeedbackViewer = ({ feedback, onRefresh }) => {
  const handleDelete = async (id) => {
    if (!confirm("Delete this feedback?")) return;
    try {
      await api.delete(`feedback/${id}/`);
      toast.success("Deleted");
      onRefresh();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-3xl font-bold text-white">User Feedback</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {feedback.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-white">{item.name}</h4>
                <p className="text-xs text-slate-500">{item.email}</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-500 text-xs font-bold">
                <Star size={12} fill="currentColor" /> {item.rating}
              </div>
            </div>

            <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-xl mb-3 italic">
              "{item.message}"
            </p>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>
                {item.event ? `Event: ${item.event}` : "General Feedback"}
              </span>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>

            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {feedback.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-500">
            <MessageSquare className="mx-auto w-12 h-12 mb-4 opacity-50" />
            No feedback received yet.
          </div>
        )}
      </div>
    </div>
  );
};
