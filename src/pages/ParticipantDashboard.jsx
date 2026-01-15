import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Download,
  Clock,
  CheckCircle,
  X,
  MapPin,
  Calendar,
  Share2,
  Printer,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const ParticipantDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

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
                        onClick={() => setSelectedTicket(reg)}
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

      {/* TICKET MODAL */}
      <TicketModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
      />
    </div>
  );
};

const TicketModal = ({ isOpen, onClose, ticket }) => {
  const ticketRef = useRef(null);

  const handlePrint = () => {
    const printContent = ticketRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Simple print trick: replace body with ticket, print, restore.
    // Ideally use a print-specific CSS class or library.
    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#fff;">
        ${printContent}
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React state cleanly
  };

  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            className="relative z-10 w-full max-w-sm"
          >
            {/* TICKET DESIGN */}
            <div
              ref={ticketRef}
              className="bg-white text-slate-900 rounded-4xl overflow-hidden shadow-2xl relative"
            >
              {/* Header Pattern */}
              <div className="h-32 bg-slate-900 relative p-6 flex flex-col justify-between">
                <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')]"></div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-cyan-400 font-black tracking-widest text-lg">
                    NEURA
                  </span>
                  <div className="px-2 py-1 bg-white/10 backdrop-blur rounded text-white text-[10px] font-bold uppercase border border-white/20">
                    Official Entry
                  </div>
                </div>
                <h2 className="text-white text-2xl font-bold z-10 leading-tight">
                  {ticket.event_title}
                </h2>
              </div>

              {/* Cutout Circles */}
              <div className="relative h-4 bg-slate-900">
                <div className="absolute -left-3 -top-3 w-6 h-6 bg-slate-900 rounded-full z-20"></div>
                <div className="absolute -right-3 -top-3 w-6 h-6 bg-slate-900 rounded-full z-20"></div>
                <div className="absolute top-0 left-0 right-0 h-4 bg-white rounded-t-4xl"></div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 pt-2 text-center bg-white">
                <div className="w-48 h-48 mx-auto mb-6 p-2 bg-white rounded-xl border-4 border-slate-900 shadow-xl">
                  <img
                    src={ticket.qr_code}
                    alt="QR"
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase">
                  {ticket.name}
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-6">
                  {ticket.college}
                </p>

                <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Team
                    </span>
                    <span className="font-bold text-slate-800 text-sm truncate block">
                      {ticket.team_name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Reg ID
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      #{ticket.id.toString().padStart(4, "0")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-100 p-4 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Admit One • Non-Transferable
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS (Not printed) */}
            <div className="mt-6 flex gap-3 justify-center">
              <Button
                onClick={handlePrint}
                className="bg-white text-slate-900 hover:bg-slate-200"
              >
                <Printer size={18} /> Print
              </Button>
              <button
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ParticipantDashboard;
