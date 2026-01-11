import { useState, useEffect } from "react";
import api from "../api/axios";
import { Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    event: "",
    team_name: "",
    team_members: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("events/").then((res) => setEvents(res.data.results || res.data));
  }, []);

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find((ev) => ev.id.toString() === eventId);
    setSelectedEvent(event);
    setFormData({ ...formData, event: eventId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("participants/", formData);
      setSuccess(true);
      toast.success("Registered Successfully!");
    } catch (err) {
      toast.error(err.response?.data?.team_name || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-slate-800 p-10 rounded-3xl border border-cyan-500/30 max-w-lg">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">You're In!</h2>
          <p className="text-slate-400">
            Check your email for the QR code/ticket.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-8 text-cyan-400 underline"
          >
            Register for another
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="max-w-2xl mx-auto bg-slate-800 p-10 rounded-3xl border border-slate-700">
        <h2 className="text-4xl font-black text-white mb-8">Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name (Leader)"
            required
            onChange={(v) => setFormData({ ...formData, name: v })}
          />
          <Input
            label="Email"
            type="email"
            required
            onChange={(v) => setFormData({ ...formData, email: v })}
          />
          <Input
            label="Phone"
            type="tel"
            required
            onChange={(v) => setFormData({ ...formData, phone: v })}
          />
          <Input
            label="College"
            required
            onChange={(v) => setFormData({ ...formData, college: v })}
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Select Event
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none"
              onChange={handleEventChange}
              required
            >
              <option value="">-- Choose Event --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {selectedEvent?.is_team_event && (
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-cyan-500/20 space-y-4 animate-in fade-in">
              <h3 className="text-cyan-400 font-bold">Team Details</h3>
              <Input
                label="Team Name"
                required
                onChange={(v) => setFormData({ ...formData, team_name: v })}
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Members (Comma separated)
                </label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-cyan-400"
                  placeholder="Alice, Bob, Charlie..."
                  onChange={(e) =>
                    setFormData({ ...formData, team_members: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white flex justify-center gap-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Send size={20} /> Submit Registration
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, onChange, type = "text", required }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase">
      {label}
    </label>
    <input
      type={type}
      required={required}
      className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-cyan-400 transition-all"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default Register;
