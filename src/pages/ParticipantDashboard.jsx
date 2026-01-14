import { useEffect, useState } from "react";
import api from "../api/axios";
import { QrCode, Download, Award, Clock } from "lucide-react";

const ParticipantDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("participants/me/")
      .then((res) => setRegistrations(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-black text-white mb-8">
          My <span className="text-cyan-400">Portal</span>
        </h2>

        <div className="grid gap-6">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-slate-800 border border-slate-700 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {reg.event_title}
                </h3>
                <div className="flex gap-4 text-slate-400 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Round {reg.current_round}
                  </span>
                  {reg.attended && (
                    <span className="text-green-400 font-bold">● Attended</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                {reg.qr_code && (
                  <a
                    href={reg.qr_code}
                    target="_blank"
                    className="p-4 bg-slate-900 rounded-2xl text-cyan-400 hover:bg-cyan-500 hover:text-slate-900 transition-all"
                  >
                    <QrCode size={24} />
                  </a>
                )}
                {reg.certificate && (
                  <a
                    href={reg.certificate}
                    download
                    className="flex items-center gap-2 px-6 py-4 bg-cyan-600 rounded-2xl font-bold text-white hover:bg-cyan-500 transition-all"
                  >
                    <Download size={20} /> Certificate
                  </a>
                )}
              </div>
            </div>
          ))}
          {!loading && registrations.length === 0 && (
            <p className="text-slate-500 text-center py-20 italic">
              You haven't registered for any events yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
