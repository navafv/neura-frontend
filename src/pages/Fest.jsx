import { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Search, Calendar } from 'lucide-react';

const Fest = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Interactive Search
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('events/').then(res => {
      setEvents(res.data.results || res.data);
      setLoading(false);
    });
  }, []);

  const filteredEvents = events.filter(ev => 
    ev.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 min-h-screen p-10">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search events..." 
            className="w-full bg-slate-800 border border-slate-700 p-4 pl-12 rounded-2xl text-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Skeleton Loading State Placeholder */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-800 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <motion.div key={event.id} layout className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                <img src={event.image} className="rounded-xl mb-4 h-40 w-full object-cover" />
                <h3 className="text-xl font-bold text-cyan-400">{event.title}</h3>
                <p className="text-slate-400 mt-2 text-sm">{event.description.substring(0, 100)}...</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fest;