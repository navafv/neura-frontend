import { useState } from "react";
import { Plus, Trash2, Edit3, CheckCircle, XCircle } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const FestsManager = ({ fests, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFest, setEditingFest] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    is_active: false,
    brochure: null,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("year", formData.year);
    // Convert boolean to string for FormData, backend might expect 'True'/'False' or 'true'/'false'
    // Django REST Framework usually handles 'true'/'false' strings correctly for boolean fields.
    data.append("is_active", formData.is_active ? "true" : "false");

    // Only append brochure if it's a new file. If it's a string (URL) or null, don't append.
    if (formData.brochure instanceof File) {
      data.append("brochure", formData.brochure);
    }

    try {
      if (editingFest) {
        // Use multipart/form-data for file uploads
        await api.patch(`fests/${editingFest.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Fest updated");
      } else {
        await api.post("fests/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Fest created");
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Operation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fest? Associated events will be deleted."))
      return;
    try {
      await api.delete(`fests/${id}/`);
      toast.success("Fest deleted");
      onRefresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const openModal = (fest = null) => {
    setEditingFest(fest);
    if (fest) {
      setFormData({
        name: fest.name,
        year: fest.year,
        is_active: fest.is_active,
        brochure: fest.brochure, // This will be a URL string
      });
    } else {
      setFormData({
        name: "",
        year: new Date().getFullYear(),
        is_active: false,
        brochure: null,
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Fest Management</h2>
        <Button onClick={() => openModal()}>
          <Plus size={18} /> New Fest
        </Button>
      </div>

      <div className="grid gap-4">
        {fests.map((fest) => (
          <div
            key={fest.id}
            className={`p-6 rounded-2xl border flex justify-between items-center ${
              fest.is_active
                ? "bg-cyan-900/20 border-cyan-500/50"
                : "bg-slate-800 border-slate-700"
            }`}
          >
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">{fest.name}</h3>
                {fest.is_active && (
                  <span className="text-xs bg-cyan-500 text-black px-2 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-slate-400">Year: {fest.year}</p>
              {fest.brochure && (
                <a
                  href={fest.brochure}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:underline"
                >
                  View Brochure
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal(fest)}
                className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-lg hover:bg-slate-600"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={() => handleDelete(fest.id)}
                className="p-2 text-red-400 hover:text-white bg-red-900/20 rounded-lg hover:bg-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFest ? "Edit Fest" : "Create Fest"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1">
              Fest Name
            </label>
            <input
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1">
                Year
              </label>
              <input
                type="number"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1">
                Brochure (PDF)
              </label>
              <input
                type="file"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-300 text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, brochure: e.target.files[0] })
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-700">
            <input
              type="checkbox"
              id="is_active"
              className="w-5 h-5 rounded accent-cyan-500"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            <label
              htmlFor="is_active"
              className="text-white font-bold cursor-pointer"
            >
              Set as Active Fest
            </label>
          </div>
          <Button isLoading={loading} className="w-full">
            {editingFest ? "Update Fest" : "Create Fest"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
