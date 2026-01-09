import { motion } from 'framer-motion';
import { Cpu, Globe, Shield, Code } from 'lucide-react';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-slate-800 to-slate-900">
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
        >
          Welcome to <span className="text-cyan-400">Neura</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto"
        >
          The official IT Club of Jamia Hamdard Kannur. We build, innovate, and lead the future of technology.
        </motion.p>
      </section>

      {/* Features Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        <Feature icon={<Code />} title="Development" desc="Web, Mobile, and Software solutions built by students." />
        <Feature icon={<Cpu />} title="Hardware" desc="Exploring IoT, Robotics, and Embedded Systems." />
        <Feature icon={<Shield />} title="Cybersecurity" desc="Promoting digital safety and ethical hacking." />
        <Feature icon={<Globe />} title="Networking" desc="Connecting tech enthusiasts across the campus." />
      </motion.div>
    </div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <motion.div 
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}}
    className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all group"
  >
    <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default Home;