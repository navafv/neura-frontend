import { useState, useEffect } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Clock, MapPin, CalendarDays, Filter } from "lucide-react";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [fests, setFests] = useState([]);
  const [selectedFest, setSelectedFest] = useState(null);
  const [selectedDay, setSelectedDay] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schRes, festRes] = await Promise.all([
          api.get("schedules/"),
          api.get("fests/"),
        ]);

        const festData = festRes.data.results || festRes.data;
        const schData = schRes.data.results || schRes.data;

        setFests(festData);
        setSchedules(schData);

        const active = festData.find((f) => f.is_active);
        if (active) setSelectedFest(active.id);
      } catch (err) {
        console.error("Error loading schedule", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract unique dates for the filter
  const uniqueDates = [
    ...new Set(
      schedules.map((item) => new Date(item.start_time).toDateString())
    ),
  ];

  const filteredSchedule = schedules
    .filter((item) => (selectedFest ? item.fest === selectedFest : true))
    .filter(
      (item) =>
        selectedDay === "All" ||
        new Date(item.start_time).toDateString() === selectedDay
    )
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-5xl font-black text-white mb-6">
            Event <span className="text-cyan-400">Timeline</span>
          </h2>

          <div className="flex flex-col items-center gap-4">
            {/* Fest Filter */}
            <div className="flex justify-center gap-2 flex-wrap">
              {fests.map((fest) => (
                <button
                  key={fest.id}
                  onClick={() => setSelectedFest(fest.id)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all border ${
                    selectedFest === fest.id
                      ? "bg-cyan-600 text-white border-cyan-600"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {fest.name}
                </button>
              ))}
            </div>

            {/* Date Filter (Only shows if multiple days exist) */}
            {uniqueDates.length > 1 && (
              <div className="flex bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setSelectedDay("All")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === "All"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Days
                </button>
                {uniqueDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDay(date)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDay === date
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="text-center text-slate-500">Loading timeline...</div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 md:ml-10 space-y-12 pb-12">
            {filteredSchedule.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative pl-8 md:pl-12"
              >
                <div className="absolute -left-2.25 top-0 w-4 h-4 bg-slate-900 border-4 border-cyan-500 rounded-full" />

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-cyan-500 font-mono text-sm mt-1">
                        <Clock size={14} />
                        {new Date(item.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 text-center">
                      <span className="block text-xs font-bold text-slate-500 uppercase">
                        {new Date(item.start_time).toLocaleString("default", {
                          month: "short",
                        })}
                      </span>
                      <span className="block text-xl font-black text-white">
                        {new Date(item.start_time).getDate()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <MapPin size={16} /> {item.location}
                  </div>

                  {item.description && (
                    <p className="text-slate-400 leading-relaxed text-sm bg-slate-900/50 p-4 rounded-xl">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {filteredSchedule.length === 0 && (
              <div className="pl-12 text-slate-500 italic">
                No schedule events found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
