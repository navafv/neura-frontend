import { motion } from 'framer-motion';
import { Cpu, Globe, Shield, Code, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="bg-slate-900 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900 to-slate-900"></div>
        
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter bg-linear-to-b from-white to-slate-500 bg-clip-text text-transparent">
              NEURA <span className="text-cyan-400 font-outline-2">2026</span>
            </h1>
            <p className="text-xl md:text-3xl text-slate-400 mb-10 font-light">
              Where Intelligence Meets Innovation. The Ultimate IT Symposium.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/fest" className="px-8 py-4 bg-cyan-500 text-slate-900 font-bold rounded-full flex items-center gap-2 hover:bg-white transition-all">
                Explore Events <ChevronRight size={20} />
              </Link>
              <Link to="/about" className="px-8 py-4 border border-slate-700 rounded-full hover:bg-slate-800 transition-all">
                Our Mission
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features with Scroll Animation */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-4xl font-bold mb-16 text-center">
            Our Core <span className="text-cyan-400">Pillars</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature icon={<Code />} title="Development" desc="Building scalable web and mobile applications using modern stacks." delay={0.1} />
            <Feature icon={<Cpu />} title="Hardware" desc="Exploring the intersection of robotics and embedded systems." delay={0.2} />
            <Feature icon={<Shield />} title="Cybersecurity" desc="Deep diving into network security and ethical hacking." delay={0.3} />
            <Feature icon={<Globe />} title="Networking" desc="Building a global community of forward-thinking techies." delay={0.4} />
          </div>
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -10 }}
    className="p-8 bg-slate-800/40 rounded-3xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all cursor-default"
  >
    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">{icon}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

export default Home;