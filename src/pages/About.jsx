import { motion } from 'framer-motion';
import { Target, Eye, Users, Zap } from 'lucide-react';

const About = () => {
  const team = [
    { name: "Club President", role: "Leadership", image: "https://via.placeholder.com/150" },
    { name: "Lead Developer", role: "Technical Head", image: "https://via.placeholder.com/150" },
    { name: "Event Coordinator", role: "Management", image: "https://via.placeholder.com/150" },
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen pb-20">
      {/* Vision & Mission Header */}
      <section className="py-20 px-6 text-center border-b border-slate-800">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 text-cyan-400"
        >
          About Neura IT Club
        </motion.h2>
        <p className="max-w-3xl mx-auto text-slate-400 text-lg leading-relaxed">
          Neura is more than just a club; it’s a hub for innovation at Jamia Hamdard Kannur. 
          Our mission is to bridge the gap between academic learning and industry standards through 
          hands-on projects, workshops, and our annual IT Fest.
        </p>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ValueCard icon={<Target />} title="Mission" desc="To empower students with cutting-edge technical expertise." />
        <ValueCard icon={<Eye />} title="Vision" desc="To become a leading student-led tech community in Kerala." />
        <ValueCard icon={<Zap />} title="Innovation" desc="Encouraging out-of-the-box thinking and creative coding." />
        <ValueCard icon={<Users />} title="Collaboration" desc="Growing together through peer-to-peer learning." />
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h3 className="text-3xl font-bold text-center mb-12">Meet the Team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {team.map((member, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -10 }}
              className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 text-center p-6"
            >
              <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-cyan-500/20" />
              <h4 className="text-xl font-bold">{member.name}</h4>
              <p className="text-cyan-400 text-sm">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ValueCard = ({ icon, title, desc }) => (
  <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all">
    <div className="text-cyan-400 mb-3">{icon}</div>
    <h4 className="text-lg font-bold mb-2">{title}</h4>
    <p className="text-slate-400 text-sm">{desc}</p>
  </div>
);

export default About;