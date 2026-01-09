import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("leaderboard/")
      .then((res) => setData(res.data))
      .catch(() => console.error("Error fetching leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Trophy className="mx-auto text-yellow-500 w-16 h-16 mb-4" />
          <h2 className="text-5xl font-black text-white">The <span className="text-cyan-400">Hall of Fame</span></h2>
          <p className="text-slate-400 mt-4">Recognizing the technical champions of Neura IT Club.</p>
        </div>

        {loading ? (
          <div className="text-center text-cyan-400 font-mono animate-pulse text-xl">Accessing Database...</div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-cyan-400 text-sm uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-8 py-6">Rank</th>
                  <th>Participant</th>
                  <th>Event</th>
                  <th className="text-right px-8">Score</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {data.map((row, i) => (
                  <motion.tr initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="border-t border-slate-700 hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      {row.rank === 1 ? <Medal className="text-yellow-400" /> : row.rank}
                    </td>
                    <td className="font-bold text-white">{row.participant_name}</td>
                    <td className="text-slate-400">{row.event_name}</td>
                    <td className="text-right px-8 text-cyan-400 font-mono font-bold">{row.points}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;