import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('token/', credentials);
      localStorage.setItem('access_token', res.data.access);
      toast.success('Welcome back, Admin!');
      navigate('/admin-dashboard');
    } catch (err) {
      toast.error('Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Access</h2>
        <input 
          type="text" placeholder="Username" 
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-4"
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-6"
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        />
        <button className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-bold text-white">Login</button>
      </form>
    </div>
  );
};

export default Login;