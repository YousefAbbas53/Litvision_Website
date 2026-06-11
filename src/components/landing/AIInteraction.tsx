import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, BrainCircuit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AIInteraction = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI parsing / generating then redirect
    setTimeout(() => {
      navigate("/home");
    }, 3000);
  };

  return (
    <section className="py-32 flex flex-col items-center justify-center relative min-h-[50vh] overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isGenerating ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <button
              onClick={handleGenerate}
              className="interactive group relative px-10 py-5 bg-gradient-to-r from-primary to-accent rounded-full text-xl font-bold text-white shadow-[0_0_30px_rgba(255,150,50,0.4)] hover:shadow-[0_0_60px_rgba(255,150,50,0.8)] transition-all duration-300 flex items-center gap-3 overflow-hidden border border-white/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-in-out" />
              <span className="relative z-10 flex items-center gap-2">
                Generate AI Experience <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" />
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center z-10"
          >
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Central Glowing Core */}
              <motion.div 
                className="absolute z-20 w-16 h-16 bg-primary rounded-full shadow-[0_0_40px_rgba(255,150,50,0.8)] flex items-center justify-center border-2 border-amber-300/50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <BrainCircuit className="w-8 h-8 text-white drop-shadow-md" />
              </motion.div>
              
              {/* Neural network nodes traveling on orbital paths */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-2.5 bg-accent rounded-full shadow-[0_0_15px_rgba(251,191,36,0.9)]"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 2
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    marginTop: "-5px",
                    marginLeft: "-5px",
                    transformOrigin: `${50 + (i % 3) * 15}px ${(i % 2 === 0 ? 10 : -10)}px`,
                  }}
                />
              ))}

              {/* Orbital Rings */}
              <motion.div 
                className="absolute inset-0 border border-primary/20 rounded-full border-t-primary/60 border-l-primary/60"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut"} }}
              />
              <motion.div 
                className="absolute inset-4 border border-accent/20 rounded-full border-b-accent/80 border-r-accent/80"
                animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                transition={{ rotate: { duration: 5, repeat: Infinity, ease: "linear" }, scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut"} }}
              />
               <motion.div 
                className="absolute inset-8 border border-white/5 rounded-full border-t-white/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <motion.p 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-6 text-xl font-serif text-primary"
            >
              Transforming Literature...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default AIInteraction;
