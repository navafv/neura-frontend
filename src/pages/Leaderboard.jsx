import { useEffect, useState } from "react";
import api from "../api/axios";
import { Trophy } from "lucide-react";

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState({});

  useEffect(() => {
    api.get("events/").then(async (res) => {
      const eventList = res.data.results || res.data;
      setEvents(eventList);

      // Fetch results for all events
      const newResults = {};
      for (let ev of eventList) {
        try {
          const res = await api.get(`events/${ev.id}/results/`);
          if (res.data.length > 0) newResults[ev.id] = res.data;
        } catch {
          /* ignore no results */
        }
      }
      setResults(newResults);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6 text-white">
      <h1 className="text-4xl font-black text-center mb-16">
        Results <span className="text-cyan-400">Board</span>
      </h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        {events.map(
          (ev) =>
            results[ev.id] && (
              <div
                key={ev.id}
                className="bg-slate-800 rounded-3xl p-8 border border-slate-700"
              >
                <h3 className="text-2xl font-bold mb-6 text-cyan-400">
                  {ev.title}
                </h3>
                <div className="space-y-4">
                  {results[ev.id].map((winner, idx) => (
                    <div
                      key={winner.id}
                      className="flex items-center justify-between p-4 bg-slate-900 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-2xl font-black ${
                            idx === 0
                              ? "text-yellow-400"
                              : idx === 1
                              ? "text-slate-300"
                              : "text-orange-500"
                          }`}
                        >
                          #{winner.rank}
                        </span>
                        <div>
                          <p className="font-bold text-lg">
                            {winner.team_name || winner.name}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {winner.college}
                          </p>
                        </div>
                      </div>
                      {idx === 0 && <Trophy className="text-yellow-500" />}
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
