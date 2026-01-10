import { motion, useScroll, useTransform } from 'framer-motion';
import { Terminal, Cpu, Globe, Shield, Code, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="bg-slate-900 text-white selection:bg-cyan-500/30">
      {/* Dynamic Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full"></div>
        </motion.div>

        <div className="relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-8">
              <Zap size={14} fill="currentColor" /> THE FUTURE IS NEURAL
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent">
              NEURA<span className="text-cyan-400">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Jamia Hamdard's premier IT collective. We don't just study tech; we build the future.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/register" className="px-10 py-5 bg-cyan-500 hover:bg-white text-slate-900 font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group">
                Join the Revolution <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/fest" className="px-10 py-5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-2xl font-bold transition-all">
                View Event Lineup
              </Link>
            </div>
          </motion.div>
        </div>
        
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500">
          <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-cyan-400 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <Stat value="500+" label="Members" />
          <Stat value="20+" label="Events/Year" />
          <Stat value="150+" label="Projects Built" />
          <Stat value="5k+" label="Lines of Code" />
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Why <span className="text-cyan-400">Neura?</span></h2>
          <p className="text-slate-400">Empowering the next generation of digital pioneers.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card icon={<Terminal />} title="Code Labs" desc="Intensive peer-led coding sessions every weekend." />
          <Card icon={<Globe />} title="Global Network" desc="Connect with alumni working at Google, Amazon, and Meta." />
          <Card icon={<Cpu />} title="Hardware Forge" desc="Access to IoT kits and 3D printing for club projects." />
        </div>
      </section>
    </div>
  );
};

const Stat = ({ value, label }) => (
  <div className="space-y-1">
    <div className="text-4xl font-black text-cyan-400">{value}</div>
    <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">{label}</div>
  </div>
);

const Card = ({ icon, title, desc }) => (
  <motion.div whileHover={{ y: -10 }} className="p-10 bg-slate-800/30 border border-slate-800 rounded-[2.5rem] hover:border-cyan-500/50 transition-all">
    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-8">{icon}</div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

export default Home;