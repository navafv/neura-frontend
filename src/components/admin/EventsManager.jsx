import { useState } from "react";
import { Edit3, Trash2, Plus, Zap, UserPlus } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { EventForm } from "./EventForm";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const EventsManager = ({
  events,
  selectedEventId,
  onSelectEvent,
  user,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newCredentials, setNewCredentials] = useState(null);

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`events/${id}/`);
      toast.success("Event deleted");
      window.location.reload();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEvent) {
        await api.patch(`events/${editingEvent.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Event updated");
      } else {
        const res = await api.post("events/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Event created");

        // Check for auto-generated credentials
        if (res.data.auto_created_user) {
          setNewCredentials(res.data.auto_created_user);
          return; // Don't close modal immediately, show creds first
        }
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error("Operation failed");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Event Control
        </h2>
        {user.is_superuser && (
          <Button onClick={handleCreate}>
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
                    handleEdit(ev);
                  }}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ev.id);
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewCredentials(null);
        }}
        title={
          newCredentials
            ? "User Created"
            : editingEvent
            ? "Edit Event"
            : "Create Event"
        }
      >
        {newCredentials ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">
              Coordinator Account Generated
            </h3>
            <p className="text-slate-400 text-sm">
              Please save these details. They will not be shown again.
            </p>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Username:</span>
                <span className="text-white font-mono font-bold select-all">
                  {newCredentials.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Password:</span>
                <span className="text-white font-mono font-bold select-all">
                  {newCredentials.password}
                </span>
              </div>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full mt-4"
            >
              Done
            </Button>
          </div>
        ) : (
          <EventForm
            event={editingEvent}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};
