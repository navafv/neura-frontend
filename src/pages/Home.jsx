import { motion, useScroll, useTransform } from "framer-motion";
import { Terminal, Cpu, Globe, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

const Home = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="bg-slate-900 text-white overflow-hidden selection:bg-cyan-500/30">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Animated Background Elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"
        />

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 text-cyan-400 text-sm font-bold mb-8 shadow-2xl">
              <Zap size={14} fill="currentColor" /> THE FUTURE IS NEURAL
            </div>

            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-tight">
              NEURA
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600">
                .
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Jamia Hamdard's premier IT collective. Where code meets creativity
              and innovation knows no bounds.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button className="h-14 px-8 text-lg rounded-full">
                  Join the Revolution <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/fest">
                <Button
                  variant="outline"
                  className="h-14 px-8 text-lg rounded-full border-slate-700 hover:bg-slate-800"
                >
                  Explore Events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS TICKER */}
      <div className="border-y border-slate-800 bg-slate-900/50 backdrop-blur-xl relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <StatBox value="500+" label="Members" />
          <StatBox value="20+" label="Events" />
          <StatBox value="150+" label="Projects" />
          <StatBox value="∞" label="Possibilities" />
        </div>
      </div>

      {/* FEATURE CARDS */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Why <span className="text-cyan-400">Neura?</span>
            </h2>
            <p className="text-slate-400 text-xl">
              Empowering the next generation of digital pioneers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Terminal size={40} />}
              title="Code Labs"
              desc="Intensive peer-led coding sessions every weekend covering Full Stack, AI, and DevOps."
              delay={0.1}
            />
            <FeatureCard
              icon={<Globe size={40} />}
              title="Global Network"
              desc="Connect with alumni working at Google, Amazon, and Meta. Your network is your net worth."
              delay={0.2}
            />
            <FeatureCard
              icon={<Cpu size={40} />}
              title="Hardware Forge"
              desc="Access to Arduino kits, Raspberry Pis, and 3D printing for your wildest IoT projects."
              delay={0.3}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const StatBox = ({ value, label }) => (
  <div className="space-y-2">
    <div className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-slate-500">
      {value}
    </div>
    <div className="text-cyan-500 uppercase tracking-widest text-xs font-bold">
      {label}
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    whileHover={{ y: -10 }}
    className="p-10 bg-slate-800/40 border border-slate-700 rounded-[2.5rem] hover:border-cyan-500/50 hover:bg-slate-800 transition-all group"
  >
    <div className="w-20 h-20 bg-cyan-900/30 rounded-3xl flex items-center justify-center text-cyan-400 mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-900/20">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
      {title}
    </h3>
    <p className="text-slate-400 leading-relaxed text-lg">{desc}</p>
  </motion.div>
);

export default Home;
