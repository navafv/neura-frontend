import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { Calendar, MapPin, Users, Zap, Clock } from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    api.get(`events/${id}/`).then((res) => setEvent(res.data));
  }, [id]);

  if (!event) return <div className="text-white text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden mb-10 h-80">
          <img src={event.image || "https://via.placeholder.com/1200x600"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent flex items-end p-10">
            <div>
              <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 inline-block">
                {event.is_team_event ? "Team Event" : "Individual"}
              </span>
              <h1 className="text-5xl font-black">{event.title}</h1>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <p className="text-slate-400 text-lg leading-relaxed">{event.description}</p>
            
            {/* Rounds Timeline */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="text-cyan-400" /> Event Rounds
              </h3>
              <div className="space-y-6">
                {event.rounds && event.rounds.length > 0 ? (
                  event.rounds.map((round) => (
                    <div key={round.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                        <div className="w-0.5 h-full bg-slate-700 my-1"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Round {round.round_number}</h4>
                        <p className="text-slate-400 text-sm">{round.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">Rounds to be announced.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar className="text-cyan-400" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="text-cyan-400" />
                {new Date(event.date).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="text-cyan-400" />
                {event.location}
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Users className="text-cyan-400" />
                {event.is_team_event ? `Team Size: ${event.min_team_size}-${event.max_team_size}` : "Individual"}
              </div>

              <Link to="/register" className="block w-full text-center py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;