import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Info Column */}
        <motion.div initial={{x: -50}} animate={{x: 0}}>
          <h2 className="text-4xl font-bold mb-6 text-cyan-400">Get in Touch</h2>
          <p className="text-slate-400 mb-8">Have questions about Neura IT Club or the upcoming IT Fest? Drop us a message.</p>
          <div className="space-y-6">
            <ContactInfo icon={<Mail />} label="Email" val="itclub@jamiahamdard.ac.in" />
            <ContactInfo icon={<Phone />} label="Phone" val="+91 9876543210" />
            <ContactInfo icon={<MapPin />} label="Location" val="Jamia Hamdard Kannur Campus" />
          </div>
        </motion.div>

        {/* Feedback Form */}
        <motion.form initial={{x: 50}} animate={{x: 0}} className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <div className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg" />
            <textarea placeholder="Your Message" rows="5" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"></textarea>
            <button className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-bold transition-all">Send Feedback</button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

const ContactInfo = ({ icon, label, val }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-slate-800 rounded-full text-cyan-400">{icon}</div>
    <div>
      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{label}</p>
      <p className="text-lg">{val}</p>
    </div>
  </div>
);

export default Contact;