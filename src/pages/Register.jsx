import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Info, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", college: "", event: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("events/").then((res) => setEvents(res.data.results || res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("participants/", formData);
      setSuccess(true);
      toast.success("Welcome to the squad!");
    } catch (err) {
      // Errors handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-20 px-6">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            className="w-full max-w-xl bg-slate-800/50 border border-slate-700 p-10 rounded-[2.5rem] backdrop-blur-xl"
          >
            <h2 className="text-4xl font-black text-white mb-2">Claim Your <span className="text-cyan-400">Seat.</span></h2>
            <p className="text-slate-400 mb-10">Select your battleground and join the competition.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Full Name" type="text" placeholder="John Doe" required onChange={v => setFormData({...formData, name: v})} />
              <Input label="Email" type="email" placeholder="john@student.com" required onChange={v => setFormData({...formData, email: v})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone" type="tel" placeholder="+91..." required onChange={v => setFormData({...formData, phone: v})} />
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Event</label>
                  <select 
                    required 
                    className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-400 transition-colors appearance-none"
                    onChange={e => setFormData({...formData, event: e.target.value})}
                  >
                    <option value="">Choose Event</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id} disabled={new Date(ev.date) < new Date()}>
                        {ev.title} {new Date(ev.date) < new Date() ? "(Closed)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Input label="College" type="text" placeholder="Jamia Hamdard" required onChange={v => setFormData({...formData, college: v})} />
              
              <button disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                {loading ? "Processing..." : <><Send size={20} /> Secure Spot</>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-slate-800 p-16 rounded-[3rem] border border-cyan-500/30"
          >
            <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-cyan-400">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">You're In!</h2>
            <p className="text-slate-400 mb-10">A confirmation email has been dispatched to your inbox.</p>
            <button onClick={() => setSuccess(false)} className="flex items-center gap-2 mx-auto text-cyan-400 font-bold hover:underline">
              <ArrowLeft size={18} /> Back to Events
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Input = ({ label, onChange, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      {...props}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-400 transition-colors"
    />
  </div>
);

export default Register;