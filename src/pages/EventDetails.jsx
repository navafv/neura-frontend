import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import {
  Calendar,
  MapPin,
  Users,
  Zap,
  Clock,
  ArrowLeft,
  Download,
  AlertTriangle,
  List,
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [qualifiers, setQualifiers] = useState([]);

  useEffect(() => {
    api.get(`events/${id}/`).then((res) => setEvent(res.data));
    api
      .get(`events/${id}/qualifiers/`)
      .then((res) => setQualifiers(res.data))
      .catch(() => {});
  }, [id]);

  if (!event)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-cyan-400 animate-pulse">
        Loading...
      </div>
    );

  // Filter qualifiers to only show those in the highest active round (approximate logic for "Current Round")
  const maxRound =
    qualifiers.length > 0
      ? Math.max(...qualifiers.map((q) => q.current_round))
      : 1;
  const currentQualifiers = qualifiers.filter(
    (q) => q.current_round === maxRound && maxRound > 1
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
        <img
          src={event.image || "https://via.placeholder.com/1200x600"}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12 max-w-7xl mx-auto">
          <Link
            to="/fest"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} /> Back to Fest
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-cyan-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {event.is_team_event ? "Team Event" : "Individual"}
            </span>
            <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
              {event.fest_name}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">
              About Event
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          {currentQualifiers.length > 0 && (
            <section className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                <List size={20} /> Qualified for Round {maxRound}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQualifiers.map((q, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 p-3 rounded-xl flex items-center justify-between border border-slate-800"
                  >
                    <span className="font-bold">{q.team_name || q.name}</span>
                    <span className="text-xs text-slate-500">{q.college}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-slate-800/50 p-8 rounded-4xl border border-slate-700">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Zap className="text-yellow-400" fill="currentColor" />{" "}
              Competition Rounds
            </h3>
            <div className="relative space-y-8 pl-4">
              <div className="absolute left-5.75 top-2 bottom-2 w-0.5 bg-slate-700" />
              {event.rounds &&
                event.rounds.map((round) => (
                  <div
                    key={round.id}
                    className="relative flex gap-6 items-start group"
                  >
                    <div className="w-5 h-5 mt-1 rounded-full bg-slate-900 border-4 border-cyan-500 z-10" />
                    <div>
                      <h4 className="font-bold text-xl text-white">
                        Round {round.round_number}
                      </h4>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                        {round.name}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 p-8 rounded-4xl border border-slate-700 space-y-6 sticky top-24">
            <div className="space-y-4">
              <InfoRow
                icon={<Calendar />}
                label="Date"
                value={new Date(event.date).toDateString()}
              />
              <InfoRow
                icon={<Clock />}
                label="Time"
                value={new Date(event.date).toLocaleTimeString()}
              />
              <InfoRow icon={<MapPin />} label="Venue" value={event.location} />
              <InfoRow
                icon={<Users />}
                label="Format"
                value={
                  event.is_team_event
                    ? `Teams (${event.min_team_size}-${event.max_team_size})`
                    : "Solo"
                }
              />
              {event.registration_deadline && (
                <InfoRow
                  icon={<AlertTriangle className="text-yellow-500" />}
                  label="Deadline"
                  value={new Date(event.registration_deadline).toDateString()}
                />
              )}
            </div>

            {event.pdf_resource && (
              <a
                href={event.pdf_resource}
                target="_blank"
                className="block w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-center text-white border border-slate-600 flex items-center justify-center gap-2"
              >
                <Download size={18} /> Rulebook
              </a>
            )}

            {event.is_registration_open ? (
              <Link
                to="/register"
                className="block w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-center text-lg shadow-lg shadow-cyan-500/20"
              >
                Register Now
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-slate-700 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
              >
                Registration Closed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 text-slate-300">
    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-cyan-400">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default EventDetails;
