import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Plus, X } from "lucide-react";
import api from "../../api/axios";

export const EventForm = ({ event, onSubmit, onCancel }) => {
  const [fests, setFests] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    registration_deadline: "",
    location: "Main Auditorium",
    registration_fee: 0,
    min_team_size: 1,
    max_team_size: 1,
    max_participants: 100,
    is_team_event: false,
    custom_fields: [],
    fest: "",
    coordinator: "",
    // Files (handled separately)
    image: null,
    payment_qr: null,
    pdf_resource: null,
  });

  const [newField, setNewField] = useState("");

  useEffect(() => {
    api.get("fests/").then((res) => setFests(res.data.results || res.data));
    api.get("users/").then((res) => setUsers(res.data.results || res.data));

    if (event) {
      setFormData({
        ...formData,
        ...event,
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
        registration_deadline: event.registration_deadline
          ? new Date(event.registration_deadline).toISOString().slice(0, 16)
          : "",
        image: null, // Clear file inputs on edit
        payment_qr: null,
        pdf_resource: null,
      });
    }
  }, [event]);

  const addCustomField = () => {
    if (newField) {
      setFormData({
        ...formData,
        custom_fields: [...formData.custom_fields, newField],
      });
      setNewField("");
    }
  };

  const removeCustomField = (index) => {
    const updated = [...formData.custom_fields];
    updated.splice(index, 1);
    setFormData({ ...formData, custom_fields: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "custom_fields") {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(v) => setFormData({ ...formData, title: v })}
          required
        />

        <div>
          <label className="text-xs text-slate-500 uppercase font-bold ml-1">
            Fest
          </label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
            value={formData.fest}
            onChange={(e) => setFormData({ ...formData, fest: e.target.value })}
            required
          >
            <option value="">Select Fest</option>
            {fests.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date & Time"
          type="datetime-local"
          value={formData.date}
          onChange={(v) => setFormData({ ...formData, date: v })}
          required
        />
        <Input
          label="Reg. Deadline"
          type="datetime-local"
          value={formData.registration_deadline}
          onChange={(v) =>
            setFormData({ ...formData, registration_deadline: v })
          }
        />

        <Input
          label="Location"
          value={formData.location}
          onChange={(v) => setFormData({ ...formData, location: v })}
        />
        <Input
          label="Reg. Fee (₹)"
          type="number"
          value={formData.registration_fee}
          onChange={(v) => setFormData({ ...formData, registration_fee: v })}
        />
      </div>

      <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_team"
            className="w-5 h-5 accent-cyan-500"
            checked={formData.is_team_event}
            onChange={(e) =>
              setFormData({ ...formData, is_team_event: e.target.checked })
            }
          />
          <label htmlFor="is_team" className="font-bold text-white">
            Team Event?
          </label>
        </div>

        {formData.is_team_event && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Members"
              type="number"
              value={formData.min_team_size}
              onChange={(v) => setFormData({ ...formData, min_team_size: v })}
            />
            <Input
              label="Max Members"
              type="number"
              value={formData.max_team_size}
              onChange={(v) => setFormData({ ...formData, max_team_size: v })}
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <FileInput
          label="Event Image"
          onChange={(f) => setFormData({ ...formData, image: f })}
        />
        <FileInput
          label="Payment QR"
          onChange={(f) => setFormData({ ...formData, payment_qr: f })}
        />
        <FileInput
          label="Rulebook PDF"
          onChange={(f) => setFormData({ ...formData, pdf_resource: f })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-500 uppercase font-bold ml-1">
          Custom Form Fields
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
            placeholder="e.g. GitHub Profile Link"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
          />
          <Button type="button" onClick={addCustomField}>
            <Plus size={18} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.custom_fields.map((field, idx) => (
            <span
              key={idx}
              className="bg-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 text-white"
            >
              {field}{" "}
              <X
                size={14}
                className="cursor-pointer hover:text-red-400"
                onClick={() => removeCustomField(idx)}
              />
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase font-bold ml-1">
          Description
        </label>
        <textarea
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white h-32"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="flex gap-4">
        <Button className="flex-1" type="submit">
          {event ? "Update Event" : "Create Event"}
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const Input = ({ label, type = "text", value, onChange, required }) => (
  <div>
    <label className="text-xs text-slate-500 uppercase font-bold ml-1">
      {label}
    </label>
    <input
      type={type}
      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

const FileInput = ({ label, onChange }) => (
  <div>
    <label className="text-xs text-slate-500 uppercase font-bold ml-1">
      {label}
    </label>
    <input
      type="file"
      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-400 text-sm"
      onChange={(e) => onChange(e.target.files[0])}
    />
  </div>
);
