import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    event: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Fetch events from Django so students can pick one
    api.get("events/").then((res) => setEvents(res.data));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post("participants/", formData)
      .then(() => {
        toast.success("Registered Successfully! See you at Neura!");
        setSubmitted(true);
      })
      .catch(() => toast.error("Check your details and try again."));
  };

  if (submitted)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center p-10 bg-slate-800 rounded-2xl border border-cyan-500"
        >
          <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Registration Successful!</h2>
          <p className="mt-2 text-slate-400">
            We will contact you soon with further details.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-cyan-400 hover:underline"
          >
            Register for another event
          </button>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-6 text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700"
      >
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">
          Event Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            required
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <select
            required
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-400"
            onChange={(e) =>
              setFormData({ ...formData, event: e.target.value })
            }
          >
            <option value="">Select Event</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <textarea
            placeholder="College/Department"
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, college: e.target.value })
            }
          />

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <Send size={18} /> Submit Registration
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
