import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Search, Calendar, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const Fest = () => {
  const [fests, setFests] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedFest, setSelectedFest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Fetch Fests
        const festRes = await api.get("fests/"); // Using the new Fest endpoint
        const festData = festRes.data.results || festRes.data;
        setFests(festData);

        // Default to the latest active fest
        const activeFest = festData.find((f) => f.is_active) || festData[0];
        if (activeFest) setSelectedFest(activeFest.id);

        // 2. Fetch Events
        const eventRes = await api.get("events/");
        setEvents(eventRes.data.results || eventRes.data);
      } catch {
        console.error("Error loading fest data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    // If a fest is selected, filter by that fest. If ev.fest is just an ID, compare IDs.
    const matchesFest = selectedFest ? ev.fest === selectedFest : true;
    return matchesSearch && matchesFest;
  });

  return (
    <div className="bg-slate-900 min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full bg-slate-800 border border-slate-700 p-4 pl-12 rounded-2xl text-white focus:border-cyan-400 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Fest Filter */}
          <div className="flex gap-2 overflow-x-auto max-w-full no-scrollbar">
            {fests.map((fest) => (
              <button
                key={fest.id}
                onClick={() => setSelectedFest(fest.id)}
                className={`whitespace-nowrap px-6 py-4 rounded-2xl font-bold transition-all border ${
                  selectedFest === fest.id
                    ? "bg-cyan-500 text-slate-900 border-cyan-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {fest.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-slate-800 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Link to={`/event/${event.id}`} key={event.id}>
                <motion.div
                  layout
                  whileHover={{ y: -10 }}
                  className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden h-full flex flex-col group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={event.image}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-slate-700">
                      {event.is_team_event ? "Team" : "Solo"}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                      <Calendar size={14} />{" "}
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-1">
                      {event.description}
                    </p>

                    <div className="w-full py-3 bg-slate-700/50 rounded-xl text-center font-bold text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                      View Details
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-500">
                No events found for this selection.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fest;