import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const GalleryManager = ({ gallery, onRefresh }) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !title) return toast.error("Image and Title required");

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);

    try {
      await api.post("gallery/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded!");
      setTitle("");
      setImage(null);
      onRefresh();
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`gallery/${id}/`);
      toast.success("Deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <h2 className="text-3xl font-bold text-white">Gallery Manager</h2>

      {/* Upload Area */}
      <Card className="bg-slate-800 border-slate-700">
        <form
          onSubmit={handleUpload}
          className="flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Title
            </label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hackathon 2026 Winner"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-300"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <Button isLoading={loading} className="w-full md:w-auto">
            <Plus size={18} /> Upload
          </Button>
        </form>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800"
          >
            <img
              src={img.image}
              alt={img.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-2">
              <p className="text-white font-bold text-sm mb-2">{img.title}</p>
              <button
                onClick={() => handleDelete(img.id)}
                className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
