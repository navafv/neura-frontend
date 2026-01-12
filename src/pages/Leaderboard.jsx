import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await api.get("events/");
        const eventList = eventsRes.data.results || eventsRes.data;
        setEvents(eventList);

        const newResults = {};
        await Promise.all(
          eventList.map(async (ev) => {
            try {
              // Only fetch if backend allows it (results_published=True)
              // If not published, backend returns 403, catch block handles it silently.
              const res = await api.get(`events/${ev.id}/results/`);
              if (res.data && res.data.length > 0) {
                newResults[ev.id] = res.data;
              }
            } catch {
              // Silently ignore unpublished events
            }
          })
        );
        setResults(newResults);
      } catch {
        console.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <Trophy className="mx-auto text-yellow-500 w-20 h-20 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">
            Hall of{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500">
              Fame
            </span>
          </h2>
          <p className="text-slate-400 mt-4 text-lg">
            Celebrating the champions of Neura IT Fest.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {events.map(
              (ev) =>
                results[ev.id] && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    key={ev.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm hover:border-cyan-500/30 transition-all"
                  >
                    <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white truncate">
                        {ev.title}
                      </h3>
                      <Award className="text-cyan-500" size={20} />
                    </div>
                    <div className="p-4 space-y-3">
                      {results[ev.id].map((winner, idx) => (
                        <div
                          key={winner.id}
                          className={`flex items-center gap-4 p-4 rounded-xl ${
                            idx === 0
                              ? "bg-linear-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
                              : "bg-slate-900/50"
                          }`}
                        >
                          <div
                            className={`text-2xl font-black w-8 ${
                              idx === 0
                                ? "text-yellow-400"
                                : idx === 1
                                ? "text-slate-300"
                                : "text-orange-500"
                            }`}
                          >
                            #{winner.rank}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-white">
                              {winner.team_name || winner.name}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {winner.team_name
                                ? `${winner.name} (Team Lead)`
                                : winner.college}
                            </p>
                          </div>
                          {idx === 0 && (
                            <Medal className="ml-auto text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
            )}
            {Object.keys(results).length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-500">
                Results have not been announced yet. Stay tuned!
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
