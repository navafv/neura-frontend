import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = false, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={`bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
