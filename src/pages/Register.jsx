import { useState, useEffect } from "react";
import api from "../api/axios";
import { Send, CheckCircle, ArrowLeft } from "lucide-react";
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
      const errorMsg =
        err.response?.data?.team_name ||
        err.response?.data?.non_field_errors ||
        "Registration failed.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-slate-800 p-12 rounded-[2.5rem] border border-cyan-500/30 max-w-lg shadow-2xl shadow-cyan-900/20">
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">You're In!</h2>
          <p className="text-slate-400 text-lg mb-8">
            Registration confirmed. Check your email for your unique QR Ticket.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-cyan-400 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Register for another event
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-slate-700 shadow-2xl">
        <h2 className="text-4xl font-black text-white mb-2">
          Secure <span className="text-cyan-400">Spot</span>
        </h2>
        <p className="text-slate-400 mb-8">
          Join the tech revolution at Neura IT Fest.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              required
              onChange={(v) => setFormData({ ...formData, name: v })}
            />
            <Input
              label="Email"
              type="email"
              required
              onChange={(v) => setFormData({ ...formData, email: v })}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
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
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-2">
              Select Event
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-400 transition-all appearance-none"
              onChange={handleEventChange}
              required
            >
              <option value="">-- Choose Event --</option>
              {events.map((ev) => (
                <option
                  key={ev.id}
                  value={ev.id}
                  disabled={new Date() > new Date(ev.date)}
                >
                  {ev.title} {new Date() > new Date(ev.date) ? "(Closed)" : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedEvent?.is_team_event && (
            <div className="p-6 bg-slate-900 rounded-2xl border border-cyan-500/30 space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <h3 className="text-cyan-400 font-bold uppercase text-sm tracking-wider">
                  Team Registration Required
                </h3>
              </div>
              <Input
                label="Team Name"
                required
                onChange={(v) => setFormData({ ...formData, team_name: v })}
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-2">
                  Team Members (Comma separated)
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-400 transition-all min-h-25"
                  placeholder="e.g. Alice, Bob, Charlie..."
                  onChange={(e) =>
                    setFormData({ ...formData, team_members: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-white flex justify-center items-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/25"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <Send size={20} /> Confirm Registration
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, onChange, type = "text", required }) => (
  <div className="space-y-2 w-full">
    <label className="text-xs font-bold text-slate-500 uppercase ml-2">
      {label}
    </label>
    <input
      type={type}
      required={required}
      className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-400 transition-all"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default Register;
