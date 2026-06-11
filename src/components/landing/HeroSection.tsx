import { motion } from "framer-motion";
import { useSound } from "@/components/audio/SoundManager";
import heroBookImg from "@/assets/hero-book.png";

const advancedElements = [
  { id: "video", type: "film", x: -140, y: -220, delay: 0.2, rotate: -15, scale: 0.7 },
  { id: "audio", type: "waveform", x: 140, y: -260, delay: 1.5, rotate: 10, scale: 0.65 },
  { id: "text", type: "snippet-1", x: -60, y: -320, delay: 2.8, rotate: -5, scale: 0.8 },
  { id: "ai", type: "nodes", x: 100, y: -160, delay: 0.8, rotate: 20, scale: 0.6 },
  { id: "video2", type: "film", x: -25, y: -280, delay: 2.1, rotate: 5, scale: 0.6 },
  { id: "text2", type: "snippet-2", x: 80, y: -350, delay: 4.0, rotate: -10, scale: 0.75 },
  { id: "audio2", type: "waveform", x: -160, y: -140, delay: 3.5, rotate: -8, scale: 0.55 },
];

const renderElement = (type: string) => {
  switch (type) {
    case "film":
      return (
        <div className="w-24 h-32 bg-black/90 backdrop-blur-md rounded border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden p-1 relative group">
          {/* Film holes left */}
          <div className="flex justify-between w-full h-full absolute inset-0 py-2 px-1 gap-1.5 flex-col">
            {[...Array(7)].map((_, i) => <div key={`l-${i}`} className="w-1.5 h-2 bg-white/30 rounded-[1px]" />)}
          </div>
          {/* Film holes right */}
          <div className="flex justify-between w-full h-full absolute inset-0 py-2 px-1 gap-1.5 flex-col items-end">
            {[...Array(7)].map((_, i) => <div key={`r-${i}`} className="w-1.5 h-2 bg-white/30 rounded-[1px]" />)}
          </div>
          {/* Frame */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[4.5rem] h-[6.5rem] bg-gradient-to-br from-indigo-900/60 to-black rounded-sm overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent translate-x-0.5" />
            </div>
          </div>
        </div>
      );
    case "waveform":
      return (
        <div className="w-36 h-20 bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-[0_15px_40px_rgba(255,150,50,0.25)] flex items-center justify-center gap-1.5 p-4">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: ["20%", "90%", "30%", "100%", "40%"] }}
              transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 bg-gradient-to-t from-primary via-accent to-amber-300 rounded-full shadow-[0_0_8px_rgba(255,150,50,0.6)]"
            />
          ))}
        </div>
      );
    case "snippet-1":
      return (
        <div className="w-36 h-auto bg-[#fdfbf7] dark:bg-[#1a1918] backdrop-blur-xl rounded border border-border/50 shadow-[0_15px_30px_rgba(0,0,0,0.4)] p-3 flex flex-col gap-1.5 relative overflow-hidden">
          <div className="font-mono text-[8px] text-primary/70 mb-0.5 uppercase tracking-wider font-semibold">Key Insight</div>
          <div className="w-full h-1 bg-foreground/20 rounded-full" />
          <div className="w-[85%] h-1 bg-foreground/20 rounded-full" />
          <div className="font-serif text-[11px] leading-tight text-foreground/85 mt-1.5 italic font-medium pl-2 border-l-2 border-primary/60">
            "Space is disease and danger wrapped in darkness and silence."
          </div>
        </div>
      );
    case "snippet-2":
      return (
        <div className="w-40 h-auto bg-card/95 backdrop-blur-lg rounded-md overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-primary/20 flex">
          <div className="w-1.5 bg-gradient-to-b from-primary to-amber-500 h-full" />
          <div className="p-3 w-full">
             <div className="flex gap-1.5 mb-2.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
             </div>
             <p className="font-sans text-[10px] leading-relaxed text-muted-foreground font-medium">
               To survive the infinite, humanity must rely entirely on <span className="text-foreground font-bold text-primary">adaptability</span>.
             </p>
          </div>
        </div>
      );
    case "nodes":
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute w-5 h-5 rounded-full bg-primary shadow-[0_0_30px_15px_rgba(255,150,50,0.6)] animate-pulse" />
          <svg className="absolute inset-0 w-full h-full stroke-primary/50 stroke-[2] fill-none drop-shadow-[0_0_5px_rgba(255,150,50,0.5)]" viewBox="0 0 100 100">
            <path d="M50 50 L10 20 M50 50 L90 30 M50 50 L30 90 M50 50 L80 80" />
          </svg>
          <div className="absolute top-[15%] left-[5%] w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.9)] animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-[25%] right-[5%] w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.9)] animate-pulse" />
          <div className="absolute bottom-[5%] left-[25%] w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-bounce" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[15%] right-[15%] w-2 h-2 rounded-full bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.9)] animate-pulse" />
        </div>
      );
    default:
      return null;
  }
};

const HeroSection = () => {
  const { playFlip } = useSound();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="z-10 text-center max-w-5xl mx-auto px-4 w-full flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 md:mb-12 relative z-20"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6">
            Welcome to <span className="text-gradient drop-shadow-[0_0_15px_rgba(255,150,50,0.3)]">LITVISION</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
            Transforming texts into a brilliant visual and auditory intelligence experience.
          </p>
        </motion.div>

        {/* Central Realistic Book Features */}
        <div
          className="relative mt-8 md:mt-16 h-80 md:h-[450px] flex justify-center items-end"
          onMouseEnter={() => playFlip()}
        >
          {/* Ambient Cinematic Glow Bottom Anchor */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[300px] md:w-[500px] h-16 bg-black/50 blur-[25px] rounded-[100%] z-0" />

          {/* Erupting Cinematic Elements (Portal Effect) */}
          {advancedElements.map((el) => (
            <motion.div
              key={el.id}
              initial={{ opacity: 0, scale: 0.2, filter: 'blur(15px)', y: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.2, el.scale * 1.1, el.scale, 0.9],
                filter: ['blur(15px)', 'blur(0px)', 'blur(0px)', 'blur(10px)'],
                y: [50, el.y],
                x: [0, el.x],
                rotateZ: [0, el.rotate]
              }}
              transition={{
                duration: 7, // Slower, more cinematic emergence
                delay: el.delay,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.2, 0.8, 1] // Emerge quickly, hang, then fade out smoothly
              }}
              className="absolute bottom-[35%] md:bottom-[45%] left-1/2 -translate-x-1/2 z-0 origin-bottom pointer-events-none"
            >
              {renderElement(el.type)}
            </motion.div>
          ))}

          {/* Realistic Book Image (Larger constraint) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.03, rotateZ: 1, rotateX: 3, y: -5 }}
            className="relative z-10 w-[340px] md:w-[650px] h-[260px] md:h-[420px] cursor-pointer drop-shadow-[0_50px_70px_rgba(0,0,0,0.85)] flex items-end justify-center perspective-1000"
          >
            {/* Book inner magical glow aura */}
            <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full opacity-0 hover:opacity-100 transition-opacity duration-1000" />

            <img
              src={heroBookImg}
              alt="Magic Open Book"
              className="w-full h-full object-contain mb-6 md:mb-8 drop-shadow-2xl opacity-95 transition-all duration-700 hover:brightness-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800";
                target.className = "w-[300px] md:w-[450px] h-[200px] md:h-[280px] object-cover rounded-2xl drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)] opacity-90 shadow-[0_0_50px_rgba(255,150,50,0.3)] mb-8";
              }}
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
