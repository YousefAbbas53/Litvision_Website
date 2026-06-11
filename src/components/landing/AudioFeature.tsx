import { motion } from "framer-motion";
import { useState } from "react";
import { Mic } from "lucide-react";

const AudioFeature = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Generate random heights for the waveform
  const waves = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    height: Math.random() * 60 + 10,
  }));

  return (
    <section className="py-24 relative bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:order-2"
        >
          <h2 className="text-4xl font-serif font-bold mb-4 text-foreground">
            Immersive <span className="text-primary glow-text">Audio Narration</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            Close your eyes and listen. Our AI assigns unique, lifelike voices to different characters, creating a compelling audiobook experience enhanced with subtle emotional tones.
          </p>
        </motion.div>

        <motion.div 
          className="md:order-1 relative w-full h-64 flex items-center justify-center group interactive cursor-pointer bg-card rounded-3xl border border-border overflow-hidden shadow-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Ambient Glow */}
          <div className={`absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-accent/20 blur-3xl transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Central Mic Icon */}
          <div className={`absolute z-20 w-20 h-20 rounded-full bg-card/80 backdrop-blur-xl flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(255,150,50,0.3)] transition-all duration-700 ${isHovered ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} group-hover:border-primary`}>
            <Mic className="text-primary w-10 h-10 group-hover:animate-pulse" />
          </div>

          <div className={`flex items-center justify-center gap-1.5 w-full px-8 z-10 transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            {waves.map((wave) => (
              <motion.div
                key={wave.id}
                animate={{
                  height: isHovered 
                    ? [wave.height, wave.height * (Math.random() + 0.8), wave.height] 
                    : 15,
                  backgroundColor: isHovered ? (wave.id % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))") : "#475569"
                }}
                transition={{
                  repeat: isHovered ? Infinity : 0,
                  duration: Math.random() * 0.4 + 0.4,
                  ease: "easeInOut"
                }}
                className={`w-2.5 rounded-full transition-shadow duration-500 ${isHovered ? 'shadow-[0_0_15px_rgba(255,150,50,0.7)]' : ''}`}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AudioFeature;
