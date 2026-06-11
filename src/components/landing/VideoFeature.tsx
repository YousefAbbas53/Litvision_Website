import { motion } from "framer-motion";
import { Play } from "lucide-react";

const VideoFeature = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-serif font-bold mb-4 text-foreground">
            From Words to <span className="text-primary glow-text">Cinematic Worlds</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            Experience books like never before. Our AI automatically generates rich, 
            context-aware video sequences perfectly matched to the narrative's atmosphere.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative group interactive cursor-pointer"
        >
          {/* Cinematic Bloom Background */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 via-transparent to-accent/30 rounded-3xl blur-3xl opacity-30 group-hover:opacity-80 transition-opacity duration-1000 z-0" />
          
          <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card aspect-video shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover:scale-[1.03] z-10 flex">
            
            {/* Book Binding Spine Effect (Left Side) */}
            <div className="w-6 h-full bg-gradient-to-r from-amber-950 to-amber-800 border-r border-amber-700/50 shadow-[5px_0_15px_rgba(0,0,0,0.5)] z-30 shrink-0 relative flex flex-col justify-evenly items-center py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-1 bg-black/40 border-y border-white/10" />
              ))}
            </div>

            {/* Video Content Area */}
            <div className="flex-1 relative overflow-hidden">
              {/* Dark Overlay that clears on hover */}
              <div className="absolute inset-0 bg-black/80 group-hover:bg-black/0 transition-colors duration-700 z-10 pointer-events-none" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center group-hover:scale-150 group-hover:opacity-0 transition-all duration-700 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <Play className="w-8 h-8 text-white ml-2 transition-transform duration-300 group-hover:text-primary" />
                </div>
              </div>

              {/* Simulated Video Background / GIF equivalent */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80')] bg-cover bg-center brightness-50 group-hover:brightness-110 group-hover:scale-110 transition-all duration-1000 z-0" />
              
              {/* Cinematic Letterbox (Black bars sliding in/out slightly) */}
              <div className="absolute inset-x-0 top-0 h-4 bg-black -translate-y-2 group-hover:translate-y-0 transition-transform duration-700 z-20" />
              <div className="absolute inset-x-0 bottom-0 h-4 bg-black translate-y-2 group-hover:translate-y-0 transition-transform duration-700 z-20" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default VideoFeature;
