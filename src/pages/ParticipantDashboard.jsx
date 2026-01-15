import { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { QrCode, Download, Clock, Zap, CheckCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const ParticipantDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("participants/me/")
      .then((res) => setRegistrations(res.data))
      .finally(() => setLoading(false));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6 bg-[url('/grid.svg')] bg-fixed">
      <div className="max-w-5xl mx-auto">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-5xl font-black text-white mb-2">
            My <span className="text-cyan-400">Portal</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Track your journey through the Neura Fest.
          </p>
        </motion.header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6"
          >
            {registrations.map((reg) => (
              <motion.div
                key={reg.id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  show: { y: 0, opacity: 1 },
                }}
              >
                <Card className="flex flex-col md:flex-row gap-6 items-center group hover:border-cyan-500/50 transition-colors">
                  {/* Status Indicator */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                      reg.is_winner
                        ? "bg-yellow-500 text-black shadow-[0_0_20px_#eab308]"
                        : reg.attended
                        ? "bg-cyan-600 text-white shadow-[0_0_20px_#0891b2]"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {reg.current_round}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {reg.event_title}
                    </h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full">
                        <Clock size={14} /> Round {reg.current_round} Qualified
                      </span>
                      {reg.attended && (
                        <span className="flex items-center gap-1 text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-500/20">
                          <CheckCircle size={14} /> Attended
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {reg.qr_code && (
                      <Button
                        variant="secondary"
                        onClick={() => window.open(reg.qr_code, "_blank")}
                      >
                        <QrCode size={18} />{" "}
                        <span className="hidden sm:inline">Ticket</span>
                      </Button>
                    )}
                    {reg.certificate && (
                      <Button
                        variant="primary"
                        onClick={() => window.open(reg.certificate, "_blank")}
                      >
                        <Download size={18} /> Certificate
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
