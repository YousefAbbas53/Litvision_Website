import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={className || "fixed top-6 right-6 z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-[0_0_15px_rgba(255,150,50,0.2)] hover:shadow-[0_0_20px_rgba(255,150,50,0.4)] transition-all duration-300 interactive group"}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Sun className={`absolute w-6 h-6 text-amber-500 transition-all duration-500 ${theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
        <Moon className={`absolute w-6 h-6 text-blue-400 transition-all duration-500 ${theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'}`} />
      </div>
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};
