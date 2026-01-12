import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Send,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  QrCode,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Register = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Base fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    event: "",
    team_name: "",
    team_members: "",
    transaction_id: "",
  });

  // Dynamic fields
  const [customResponses, setCustomResponses] = useState({});
  const [paymentProof, setPaymentProof] = useState(null);

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
    setCustomResponses({}); // Reset custom fields
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // Append File
    if (paymentProof) data.append("payment_proof", paymentProof);

    // Append Custom Responses as JSON
    data.append("custom_responses", JSON.stringify(customResponses));

    try {
      await api.post("participants/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      toast.success("Registered Successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Registration failed.";
      toast.error(errorMsg);
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="bg-slate-800 p-12 rounded-[2.5rem] border border-cyan-500/30 max-w-lg shadow-2xl">
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">Confirmed!</h2>
          <p className="text-slate-400 text-lg mb-8">
            You are registered. Check your email for ticket.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-cyan-400 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Register Another
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-slate-700 shadow-2xl">
        <h2 className="text-4xl font-black text-white mb-2">Registration</h2>
        <p className="text-slate-400 mb-8">Secure your spot at Neura.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-2">
              Select Event
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-400"
              onChange={handleEventChange}
              required
            >
              <option value="">-- Choose Event --</option>
              {events.map((ev) => (
                <option
                  key={ev.id}
                  value={ev.id}
                  disabled={!ev.is_registration_open}
                >
                  {ev.title} {!ev.is_registration_open ? "(Closed)" : ""}
                </option>
              ))}
            </select>
            {selectedEvent && !selectedEvent.is_registration_open && (
              <p className="text-red-400 text-sm flex items-center gap-2 mt-2">
                <AlertCircle size={16} /> Registration deadline has passed.
              </p>
            )}
          </div>

          {selectedEvent && selectedEvent.is_registration_open && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Standard Fields */}
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

              {/* Team Fields */}
              {selectedEvent.is_team_event && (
                <div className="p-6 bg-slate-900 rounded-2xl border border-cyan-500/30 space-y-4">
                  <h3 className="text-cyan-400 font-bold uppercase text-sm">
                    Team Details
                  </h3>
                  <Input
                    label="Team Name"
                    required
                    onChange={(v) => setFormData({ ...formData, team_name: v })}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2">
                      Members ({selectedEvent.min_team_size}-
                      {selectedEvent.max_team_size})
                    </label>
                    <textarea
                      className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-400"
                      placeholder="Names of other members..."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          team_members: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {selectedEvent.custom_fields &&
                selectedEvent.custom_fields.length > 0 && (
                  <div className="p-6 bg-slate-900 rounded-2xl border border-slate-700 space-y-4">
                    <h3 className="text-slate-400 font-bold uppercase text-sm">
                      Additional Info
                    </h3>
                    {selectedEvent.custom_fields.map((field, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-2">
                          {field}
                        </label>
                        <input
                          className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-cyan-400"
                          onChange={(e) =>
                            setCustomResponses({
                              ...customResponses,
                              [field]: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

              {/* Payment Section */}
              {selectedEvent.registration_fee > 0 && (
                <div className="p-6 bg-slate-900 rounded-2xl border border-yellow-500/30 space-y-6">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500">
                      <QrCode />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        Registration Fee: ₹{selectedEvent.registration_fee}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Scan QR to pay via UPI/GPay
                      </p>
                    </div>
                  </div>

                  {selectedEvent.payment_qr ? (
                    <img
                      src={selectedEvent.payment_qr}
                      alt="Payment QR"
                      className="w-48 h-48 mx-auto rounded-xl border-4 border-white"
                    />
                  ) : (
                    <div className="text-center text-red-400">
                      QR Code not uploaded by admin
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Transaction ID / UTR"
                      required
                      onChange={(v) =>
                        setFormData({ ...formData, transaction_id: v })
                      }
                    />
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2">
                        Upload Screenshot
                      </label>
                      <input
                        type="file"
                        required
                        className="w-full bg-slate-800 p-3 rounded-xl text-slate-300 text-sm"
                        onChange={(e) => setPaymentProof(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                disabled={loading}
                className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-white flex justify-center items-center gap-3 transition-all"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <Send size={20} /> Complete Registration
                  </>
                )}
              </button>
            </div>
          )}
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
