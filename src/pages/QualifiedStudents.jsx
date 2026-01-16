import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Medal, Search, Filter, Trophy } from "lucide-react";

const QualifiedStudents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [qualifiers, setQualifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all events to populate filter
        const eventsRes = await api.get("events/");
        const allEvents = eventsRes.data.results || eventsRes.data;
        setEvents(allEvents);

        // 2. Fetch qualifiers for all events
        // Note: Ideally, we'd have a single endpoint for "all qualifiers",
        // but re-using existing endpoints per event is safer without backend changes.
        const allQualifiers = [];

        await Promise.all(
          allEvents.map(async (ev) => {
            try {
              // Use the 'eligible_students' endpoint if available, or 'qualifiers'
              // Based on previous context, let's try 'qualifiers' which serves public data
              const res = await api.get(`events/${ev.id}/qualifiers/`);
              const eventQualifiers = res.data.map((q) => ({
                ...q,
                eventName: ev.title,
                eventId: ev.id,
              }));
              // Filter only those who have passed round 1 (assuming round 1 is entry)
              const promoted = eventQualifiers.filter(
                (q) => q.current_round > 1
              );
              allQualifiers.push(...promoted);
            } catch (e) {
              console.warn(`Could not fetch qualifiers for ${ev.title}`);
            }
          })
        );

        setQualifiers(allQualifiers);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Logic
  const filteredList = qualifiers.filter((q) => {
    const matchesSearch =
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.team_name &&
        q.team_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEvent =
      selectedEvent === "all" || q.eventId === parseInt(selectedEvent);

    return matchesSearch && matchesEvent;
  });

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-black text-white mb-4">
              Round <span className="text-green-400">Qualifiers</span>
            </h2>
            <p className="text-slate-400">
              Students who have successfully advanced to the next rounds.
            </p>
          </motion.div>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search student, team, or college..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:border-green-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 text-white appearance-none focus:border-green-500 outline-none"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center text-slate-500 py-20">
            Loading qualifiers...
          </div>
        ) : filteredList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((q, idx) => (
              <motion.div
                key={`${q.eventId}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/50 transition-colors"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy size={64} />
                </div>

                <div className="mb-4">
                  <span className="text-xs font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded mb-2 inline-block">
                    Qualified for Round {q.current_round}
                  </span>
                  <h3 className="text-xl font-bold text-white truncate">
                    {q.team_name || q.name}
                  </h3>
                  <p className="text-slate-400 text-sm truncate">{q.college}</p>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Event
                  </span>
                  <span className="text-sm font-medium text-slate-300">
                    {q.eventName}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700 border-dashed">
            <Medal className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No Qualifiers Found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualifiedStudents;
