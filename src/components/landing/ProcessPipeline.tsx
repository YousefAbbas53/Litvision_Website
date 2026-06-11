import { motion } from "framer-motion";
import { BookOpen, BrainCircuit, PlaySquare, Waves, FileText, ThumbsUp } from "lucide-react";

const steps = [
  { icon: BookOpen, label: "Book Input", description: "Select your desired book from the library." },
  { icon: BrainCircuit, label: "AI Processing", description: "Our AI brain reads and understands the context." },
  { icon: PlaySquare, label: "Video Generation", description: "Cinematic visuals are crafted automatically." },
  { icon: Waves, label: "Audio Narration", description: "Lifelike voiceovers are assigned to characters." },
  { icon: FileText, label: "Smart Summary", description: "Core concepts condensed into a readable format." },
  { icon: ThumbsUp, label: "Recommendations", description: "Discover similar experiences tailored to you." },
];

const ProcessPipeline = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background/50">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif font-bold mb-4"
          >
            The <span className="text-gradient">LITVISION</span> Pipeline
          </motion.h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Watch how a simple text transforms into a multi-sensory masterpiece.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between relative space-y-10 md:space-y-0">
          {/* Animated Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border/50 -translate-y-1/2 hidden md:block z-0" />
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary -translate-y-1/2 origin-left hidden md:block z-0 shadow-[0_0_15px_rgba(255,150,50,0.6)]"
          />
          
          {/* Flowing Data Particle on the line */}
          <motion.div
            initial={{ left: "0%" }}
            whileInView={{ left: "100%" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
            className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 hidden md:block z-0 shadow-[0_0_20px_5px_rgba(255,200,50,1)]"
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative z-10 flex flex-col items-center group w-full interactive"
            >
              <div className="relative w-16 h-16 shrink-0 rounded-full bg-card border-2 border-border flex items-center justify-center transition-all duration-500 group-hover:scale-125 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(255,150,50,0.6)] mb-4 z-10 overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <step.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-500 relative z-20" />
              </div>
              
              <h3 className="font-semibold text-foreground text-center mb-2 translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">{step.label}</h3>
              
              {/* Hover Explanation Tooltip (Above on Mobile, Below on Desktop) */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-[calc(100%+8px)] md:bottom-auto md:top-full md:mt-4 left-1/2 -translate-x-1/2 translate-y-2 md:translate-y-2 group-hover:translate-y-0 w-52 text-center bg-background/90 backdrop-blur-xl border border-primary/30 p-4 rounded-xl text-sm text-card-foreground shadow-[0_10px_30px_rgba(255,150,50,0.2)] pointer-events-none z-50">
                {step.description}
                {/* Carrot pointing down on mobile, up on desktop */}
                <div className="absolute top-full md:top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-background border-r border-b md:border-t md:border-l border-primary/30" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessPipeline;
