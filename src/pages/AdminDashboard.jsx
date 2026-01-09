import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Trash2, UserCheck, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('participants/');
      setRegistrations(res.data);
    } catch (err) {
      toast.error("Failed to fetch registrations");
    }
  };

  const deleteRegistration = async (id) => {
    if (window.confirm("Are you sure?")) {
      await api.delete(`participants/${id}/`);
      toast.success("Registration removed");
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Fest Control Panel</h1>
          <div className="flex gap-4">
             <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
                <UserCheck className="text-cyan-400" /> {registrations.length} Students
             </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Event</th>
                <th className="p-4">College</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-slate-700 hover:bg-slate-700/20">
                  <td className="p-4">{reg.name}</td>
                  <td className="p-4 text-cyan-400">{reg.event_name}</td>
                  <td className="p-4 text-slate-400">{reg.college}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => deleteRegistration(reg.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;