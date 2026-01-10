import { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, FileText, Lock } from 'lucide-react';

const Fest = () => {
  const [festEvents, setFestEvents] = useState([]);
  const [regularEvents, setRegularEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [festRes, regRes] = await Promise.all([
          api.get('events/?is_fest_event=true'),
          api.get('events/?is_fest_event=false')
        ]);
        setFestEvents(festRes.data.results || festRes.data);
        setRegularEvents(regRes.data.results || regRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const EventCard = ({ event, index }) => {
    const isPast = new Date(event.date) < new Date();
    const isFull = event.registration_count >= event.max_participants;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group relative bg-slate-800/40 border border-slate-700 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all"
      >
        <div className="relative h-48 overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          {(isPast || isFull) && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-red-500/20 text-red-400 px-4 py-1 rounded-full border border-red-500/50 font-bold flex items-center gap-2">
                <Lock size={16} /> {isPast ? "Started" : "Full"}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Users size={14} /> {event.registration_count}/{event.max_participants}</span>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button 
              disabled={isPast || isFull}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${isPast || isFull ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
            >
              {isPast ? "Closed" : "Register"}
            </button>
            {event.pdf_resource && (
              <a href={event.pdf_resource} target="_blank" className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">
                <FileText size={20} />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-900 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-20">
        <header className="mb-16">
          <h1 className="text-5xl font-black text-white mb-4">Technical <span className="text-cyan-400">Symposium</span></h1>
          <p className="text-slate-400 text-lg">Browse through our IT Fest competitions and general workshops.</p>
        </header>

        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-2 h-8 bg-cyan-500 rounded-full"></div> IT Fest Events
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {festEvents.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-500 rounded-full"></div> Regular Workshops
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {regularEvents.map((ev, i) => <EventCard key={ev.id} event={ev} index={i} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Fest;