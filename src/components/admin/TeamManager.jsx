import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const TeamManager = ({ team, onRefresh }) => {
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    image: null,
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newMember.name || !newMember.role)
      return toast.error("Name and Role required");

    setLoading(true);
    const formData = new FormData();
    formData.append("name", newMember.name);
    formData.append("role", newMember.role);
    formData.append("order", newMember.order);
    if (newMember.image) formData.append("image", newMember.image);

    try {
      await api.post("team/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Member added!");
      setNewMember({ name: "", role: "", image: null, order: 0 });
      onRefresh();
    } catch {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`team/${id}/`);
      toast.success("Member removed");
      onRefresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Team Management</h2>
      </div>

      {/* Add Form */}
      <Card className="bg-slate-800 p-6 flex flex-col md:flex-row gap-4 items-end border border-slate-700">
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Name
          </label>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
            value={newMember.name}
            onChange={(e) =>
              setNewMember({ ...newMember, name: e.target.value })
            }
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Role
          </label>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
            value={newMember.role}
            onChange={(e) =>
              setNewMember({ ...newMember, role: e.target.value })
            }
          />
        </div>
        <div className="w-24">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Order
          </label>
          <input
            type="number"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
            value={newMember.order}
            onChange={(e) =>
              setNewMember({ ...newMember, order: e.target.value })
            }
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Photo
          </label>
          <input
            type="file"
            className="w-full text-sm text-slate-400"
            onChange={(e) =>
              setNewMember({ ...newMember, image: e.target.files[0] })
            }
          />
        </div>
        <Button
          onClick={handleAdd}
          isLoading={loading}
          className="w-full md:w-auto"
        >
          <Plus size={18} /> Add
        </Button>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center gap-4 group hover:border-cyan-500/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden shrink-0">
              {member.image ? (
                <img
                  src={member.image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-full h-full p-2 text-slate-500" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white">{member.name}</h4>
              <p className="text-xs text-cyan-400">{member.role}</p>
            </div>
            <button
              onClick={() => handleDelete(member.id)}
              className="text-slate-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
