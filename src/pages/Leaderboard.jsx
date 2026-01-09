import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = ({ data = [] }) => {
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
      >
        <div className="p-8 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-400" /> Event Leaderboard
          </h2>
          <p className="text-slate-400 mt-2">Current rankings for the IT Fest competitions.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-cyan-400 uppercase text-sm">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-slate-700">
              {data.length > 0 ? data.map((row, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-bold">
                    {row.rank === 1 ? <Medal className="text-yellow-400" /> : 
                     row.rank === 2 ? <Medal className="text-slate-400" /> : 
                     row.rank === 3 ? <Medal className="text-amber-600" /> : row.rank}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{row.participant_name}</td>
                  <td className="px-6 py-4 text-slate-400">{row.event_name}</td>
                  <td className="px-6 py-4 text-right font-mono text-cyan-400">{row.points}</td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">
                    No rankings available yet. Stay tuned!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;