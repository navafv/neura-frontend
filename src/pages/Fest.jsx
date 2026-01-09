import { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Fest = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('events/').then(res => setEvents(res.data));
  }, []);

  return (
    <div className="bg-slate-900 min-h-screen p-10 text-white">
      <h2 className="text-4xl font-bold text-center mb-12">Upcoming IT Fest 2026</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {events.map((event, index) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all"
          >
            <img src={event.image} alt={event.title} className="rounded-lg mb-4 h-40 w-full object-cover" />
            <h3 className="text-xl font-bold text-cyan-400">{event.title}</h3>
            <p className="text-slate-400 mt-2">{event.description}</p>
            <button className="mt-4 w-full bg-cyan-600 py-2 rounded-lg font-semibold hover:bg-cyan-500">Register Now</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Fest;