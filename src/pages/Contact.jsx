import { useState } from 'react';
import api from '../api/axios';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('feedback/', form);
      toast.success("Feedback received! Thank you.");
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-32 px-6">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-12 border border-slate-700 shadow-2xl">
        <h2 className="text-4xl font-bold text-white mb-4">Connect with <span className="text-cyan-400">Neura</span></h2>
        <p className="text-slate-400 mb-10">Send us a message or report any bugs you find on our platform.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input required placeholder="Your Name" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-400 outline-hidden" 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input required type="email" placeholder="Email" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-400 outline-hidden" 
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <textarea required placeholder="Write your message..." rows="5" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-400 outline-hidden" 
            value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          
          <button disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            {loading ? "Sending..." : <><Send size={18} /> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;