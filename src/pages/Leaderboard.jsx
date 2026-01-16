import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [collegeData, setCollegeData] = useState([]);
  const [results, setResults] = useState({}); // { eventId: [winners] }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, collegeRes] = await Promise.all([
          api.get("events/"),
          api.get("events/college_leaderboard/"),
        ]);

        const allEvents = eventsRes.data.results || eventsRes.data;
        setEvents(allEvents);
        setCollegeData(collegeRes.data);

        // Fetch results for published events
        const resultsMap = {};
        await Promise.all(
          allEvents.map(async (event) => {
            // Only attempt to fetch if flag is true to avoid 403
            if (event.results_published) {
              try {
                const res = await api.get(`events/${event.id}/results/`);
                resultsMap[event.id] = res.data;
              } catch {
                // Silently ignore 403s or other errors for individual events
                // This prevents console spam for unpublished events if logic slips
              }
            }
          })
        );
        setResults(resultsMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <header className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-black text-white mb-4">
              Hall of <span className="text-cyan-400">Fame</span>
            </h2>
            <p className="text-slate-400">
              Celebrating excellence at Neura Fest
            </p>
          </motion.div>
        </header>

        {/* COLLEGE STANDINGS */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Crown className="text-yellow-500 w-8 h-8" />
            <h3 className="text-3xl font-bold text-white">Top Colleges</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {collegeData.slice(0, 3).map((col, idx) => (
              <motion.div
                key={col.college}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  idx === 0
                    ? "bg-yellow-500/10 border-yellow-500/50"
                    : idx === 1
                    ? "bg-slate-800 border-slate-600"
                    : "bg-slate-800/50 border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-4xl font-black text-white mb-2">
                      #{idx + 1}
                    </div>
                    <div className="font-bold text-lg text-slate-200">
                      {col.college}
                    </div>
                  </div>
                  <div className="bg-slate-900 px-4 py-2 rounded-xl text-cyan-400 font-mono font-bold">
                    {col.points} PTS
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* EVENT WINNERS */}
        <div className="grid gap-12">
          {events.map((event) => {
            const winners = results[event.id];
            if (!winners || winners.length === 0) return null;

            return (
              <section
                key={event.id}
                className="animate-in fade-in slide-in-from-bottom-8"
              >
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                  <Trophy className="text-cyan-500" />
                  <h3 className="text-2xl font-bold text-white">
                    {event.title}
                  </h3>
                  {event.is_team_event && (
                    <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-400">
                      Team Event
                    </span>
                  )}
                </div>

                <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                      <tr>
                        <th className="p-4 w-16">Rank</th>
                        <th className="p-4">
                          {event.is_team_event ? "Team Name" : "Participant"}
                        </th>
                        {event.is_team_event && (
                          <th className="p-4">Members</th>
                        )}
                        <th className="p-4">College</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                      {winners.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-700/30">
                          <td className="p-4 font-black text-xl">
                            {w.rank === 1 && (
                              <Medal
                                className="inline text-yellow-400 mr-2"
                                size={20}
                              />
                            )}
                            {w.rank === 2 && (
                              <Medal
                                className="inline text-gray-300 mr-2"
                                size={20}
                              />
                            )}
                            {w.rank === 3 && (
                              <Medal
                                className="inline text-orange-400 mr-2"
                                size={20}
                              />
                            )}
                            {w.rank}
                          </td>
                          <td className="p-4 font-bold text-white">
                            {event.is_team_event ? w.team_name : w.name}
                          </td>
                          {event.is_team_event && (
                            <td className="p-4 text-sm text-slate-400">
                              {w.team_members}
                            </td>
                          )}
                          <td className="p-4">{w.college}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
