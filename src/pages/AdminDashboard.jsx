import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Trash2, UserCheck, Calendar, Trophy, Image, MessageSquare, 
  Download, Plus, Edit3, X, Save, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('participants');
  const [data, setData] = useState({
    events: [],
    participants: [],
    leaderboard: [],
    gallery: [],
    feedback: []
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ev, pa, ld, ga, fe] = await Promise.all([
        api.get('events/'),
        api.get('participants/'),
        api.get('leaderboard/'),
        api.get('gallery/'),
        api.get('feedback/')
      ]);
      setData({
        events: ev.data.results || ev.data,
        participants: pa.data.results || pa.data,
        leaderboard: ld.data.results || ld.data,
        gallery: ga.data.results || ga.data,
        feedback: fe.data.results || fe.data
      });
    } catch (err) {
      toast.error("Security Clearance Failed: Could not fetch administrative data.");
    } finally {
      setLoading(false);
    }
  };

  // --- CSV Export Logic ---
  const exportParticipantsCSV = () => {
    const headers = ["Name,Email,Phone,College,Event,Registered At\n"];
    const rows = data.participants.map(p => 
      `${p.name},${p.email},${p.phone},${p.college},${p.event_name},${p.registered_at}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Neura_Participants_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("CSV Export Triggered");
  };

  const deleteItem = async (endpoint, id) => {
    if (window.confirm("Danger Zone: This action cannot be undone. Proceed?")) {
      try {
        await api.delete(`${endpoint}/${id}/`);
        toast.success("Record purged successfully");
        fetchAllData();
      } catch (err) {
        toast.error("Deletion Failed");
      }
    }
  };

  const tabs = [
    { id: 'participants', name: 'Registrations', icon: <UserCheck size={18} /> },
    { id: 'events', name: 'Events', icon: <Calendar size={18} /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <Trophy size={18} /> },
    { id: 'gallery', name: 'Media', icon: <Image size={18} /> },
    { id: 'feedback', name: 'Intel/Feedback', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-10 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              Command <span className="text-cyan-400">Center</span>
            </h1>
            <p className="text-slate-400 mt-1">Management override for Neura IT Club systems.</p>
          </div>
          <div className="flex gap-4">
            <StatBox icon={<UserCheck className="text-cyan-400" />} count={data.participants.length} label="Students" />
            <StatBox icon={<Calendar className="text-blue-400" />} count={data.events.length} label="Events" />
          </div>
        </header>

        {/* Navigation Sidebar/Tabs */}
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                  : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-800/40 border border-slate-700 rounded-[2.5rem] p-8 backdrop-blur-xl"
              >
                {/* Dynamic Toolbar */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold capitalize">{activeTab} Management</h2>
                  <div className="flex gap-3">
                    {activeTab === 'participants' && (
                      <button onClick={exportParticipantsCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold transition-all">
                        <Download size={16} /> Export CSV
                      </button>
                    )}
                    {(activeTab === 'events' || activeTab === 'leaderboard' || activeTab === 'gallery') && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-bold transition-all">
                        <Plus size={16} /> New Entry
                      </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64 text-cyan-400 font-mono animate-pulse">
                    Decrypting Database...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {activeTab === 'participants' && (
                      <Table headers={['Name', 'Email', 'Event', 'College', 'Actions']}>
                        {data.participants.map(reg => (
                          <tr key={reg.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                            <td className="p-4 font-bold">{reg.name}</td>
                            <td className="p-4 text-slate-400">{reg.email}</td>
                            <td className="p-4 text-cyan-400 font-medium">{reg.event_name}</td>
                            <td className="p-4 text-slate-400">{reg.college}</td>
                            <td className="p-4"><ActionButtons onDelete={() => deleteItem('participants', reg.id)} /></td>
                          </tr>
                        ))}
                      </Table>
                    )}

                    {activeTab === 'events' && (
                      <Table headers={['Event Title', 'Date', 'Type', 'Limit', 'Actions']}>
                        {data.events.map(ev => (
                          <tr key={ev.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                            <td className="p-4 font-bold">{ev.title}</td>
                            <td className="p-4">{new Date(ev.date).toLocaleDateString()}</td>
                            <td className="p-4 italic text-blue-400">{ev.is_fest_event ? "Fest" : "General"}</td>
                            <td className="p-4 font-mono">{ev.registration_count}/{ev.max_participants}</td>
                            <td className="p-4"><ActionButtons onDelete={() => deleteItem('events', ev.id)} /></td>
                          </tr>
                        ))}
                      </Table>
                    )}

                    {activeTab === 'feedback' && (
                      <div className="space-y-4">
                        {data.feedback.map(f => (
                          <div key={f.id} className="p-6 bg-slate-900/50 border border-slate-700 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-white">{f.name}</h4>
                                <p className="text-xs text-slate-500 font-mono">{f.email}</p>
                              </div>
                              <button onClick={() => deleteItem('feedback', f.id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg">
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="text-slate-300 italic text-sm leading-relaxed">"{f.message}"</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Placeholder for Media & Leaderboard follows same logic */}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, count, label }) => (
  <div className="bg-slate-800 px-6 py-4 rounded-2xl border border-slate-700 flex items-center gap-4">
    <div className="p-3 bg-slate-900 rounded-xl">{icon}</div>
    <div>
      <div className="text-2xl font-black leading-none">{count}</div>
      <div className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold mt-1">{label}</div>
    </div>
  </div>
);

const Table = ({ headers, children }) => (
  <table className="w-full text-left border-collapse">
    <thead className="bg-slate-900/50">
      <tr>
        {headers.map(h => <th key={h} className="p-4 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">{h}</th>)}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex gap-2">
    <button onClick={onEdit} className="text-slate-400 hover:text-cyan-400 p-2 transition-colors"><Edit3 size={16} /></button>
    <button onClick={onDelete} className="text-slate-400 hover:text-red-400 p-2 transition-colors"><Trash2 size={16} /></button>
  </div>
);

export default AdminDashboard;