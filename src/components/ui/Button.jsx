import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white",
    outline:
      "border-2 border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
      {children}
    </motion.button>
  );
};
