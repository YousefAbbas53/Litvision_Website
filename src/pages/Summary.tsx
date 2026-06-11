import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { getBookById } from "@/lib/books";
import { ArrowLeft, BookOpen, Headphones, Layers, Play, Pause } from "lucide-react";
import { useSound } from "@/components/audio/SoundManager";

type SummaryView = "none" | "chapter" | "parts" | "audio";

const chapterData = [
  { id: 1, title: "Chapter 1: The Inciting Incident", summary: "An introduction to the complex world and the protagonist's early struggles before the central conflict begins." },
  { id: 2, title: "Chapter 2: The Rising Action", summary: "A major turning point occurs that sets the grand adventure into motion, revealing hidden truths." },
  { id: 3, title: "Chapter 3: The Climax", summary: "The highest point of tension where the protagonist directly confronts their greatest challenge." },
  { id: 4, title: "Chapter 4: Resolution", summary: "The ending where all tied threads resolve beautifully, leaving a lasting impact." },
];

const partsData = [
  { id: 1, title: "Part I: Setup", text: "Establishes the universe's rules, the primary conflict, and introduces the key players." },
  { id: 2, title: "Part II: Confrontation", text: "Tensions rise as the antagonist reveals their master plan, forcing difficult choices." },
  { id: 3, title: "Part III: Evolution", text: "The culmination of the hero's journey, fundamentally changing the world around them." },
];

const Summary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const book = getBookById(id || "");
  const [view, setView] = useState<SummaryView>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const { playHover, playFlip } = useSound();

  const handleSetView = (newView: SummaryView) => {
    if (view !== newView) {
      playFlip();
      setView(newView);
      if (newView !== "audio") setIsPlaying(false);
    } else {
      setView("none"); // toggle off
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    playFlip();
  };

  if (!book) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-lg text-muted-foreground">Summary not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          onMouseEnter={() => playHover()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors interactive"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-foreground">
            {book.title}
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">{book.author}</p>

          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium tracking-wider uppercase text-primary">
              Core Overview
            </span>
          </div>

          <p className="leading-relaxed text-foreground opacity-90 text-lg md:text-xl font-light border-l-2 border-primary/30 pl-4 mb-10">
            {book.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pb-6 border-b border-border/50">
            <button 
              onClick={() => handleSetView("chapter")}
              onMouseEnter={() => playHover()}
              className={`w-full sm:w-auto group relative px-6 py-3 border shadow-md rounded-full flex items-center justify-center gap-3 transition-all duration-300 interactive ${view === "chapter" ? "bg-amber-500/10 border-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.2)]" : "bg-card border-border hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:border-amber-500/50 hover:bg-amber-500/5"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <BookOpen className={`w-5 h-5 transition-colors relative z-10 ${view === "chapter" ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-amber-500/70 group-hover:text-amber-500"}`} />
              <span className={`font-medium transition-colors relative z-10 ${view === "chapter" ? "text-amber-500" : "text-foreground group-hover:text-amber-500"}`}>By Chapter</span>
            </button>
            
            <button 
              onClick={() => handleSetView("parts")}
              onMouseEnter={() => playHover()}
              className={`w-full sm:w-auto group relative px-6 py-3 border shadow-md rounded-full flex items-center justify-center gap-3 transition-all duration-300 interactive ${view === "parts" ? "bg-blue-500/10 border-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.2)]" : "bg-card border-border hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] hover:border-blue-500/50 hover:bg-blue-500/5"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Layers className={`w-5 h-5 transition-colors relative z-10 ${view === "parts" ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-blue-500/70 group-hover:text-blue-500"}`} />
              <span className={`font-medium transition-colors relative z-10 ${view === "parts" ? "text-blue-500" : "text-foreground group-hover:text-blue-500"}`}>By Parts</span>
            </button>

            <button
              onClick={() => handleSetView("audio")}
              onMouseEnter={() => playHover()}
              className={`w-full sm:w-auto sm:ml-auto group relative px-6 py-3 border shadow-md rounded-full flex items-center justify-center gap-3 transition-all duration-300 interactive ${view === "audio" ? "bg-primary/10 border-primary shadow-[0_10px_30px_rgba(255,150,50,0.2)]" : "bg-card border-border hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,150,50,0.2)] hover:border-primary/50 hover:bg-primary/5"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Headphones className={`w-5 h-5 transition-colors relative z-10 ${view === "audio" ? "text-primary drop-shadow-[0_0_8px_rgba(255,150,50,0.5)]" : "text-primary/70 group-hover:text-primary"}`} />
              <span className={`font-medium transition-colors relative z-10 ${view === "audio" ? "text-primary" : "text-foreground group-hover:text-primary"}`}>Listen</span>
            </button>
          </div>

          {/* Dynamic Content Views */}
          <AnimatePresence mode="wait">
            {view === "chapter" && (
              <motion.div 
                key="chapter"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-8 pb-4">
                  {chapterData.map((chap, i) => (
                    <motion.div 
                      key={chap.id} 
                      initial={{opacity: 0, x: -20}} 
                      animate={{opacity: 1, x: 0}} 
                      transition={{delay: i * 0.15, duration: 0.5, ease: "easeOut"}} 
                      className="group p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-amber-500/30 transition-all duration-300"
                    >
                      <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                        <span className="text-amber-500 text-sm">{(i+1).toString().padStart(2, '0')}</span> 
                        {chap.title.split(":")[1] || chap.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed pl-6 border-l border-amber-500/20">{chap.summary}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === "parts" && (
              <motion.div 
                key="parts"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-4 pt-8 pb-4">
                  {partsData.map((part, i) => (
                    <motion.div 
                      key={part.id} 
                      initial={{opacity: 0, scale: 0.95, y: 20}} 
                      animate={{opacity: 1, scale: 1, y: 0}} 
                      transition={{delay: i * 0.15, duration: 0.5, ease: "easeOut"}} 
                      className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border hover:border-blue-500/40 transition-colors shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                        <Layers className="w-4 h-4 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-xl mb-3 text-foreground">{part.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{part.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === "audio" && (
              <motion.div 
                key="audio"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-b from-card to-background rounded-3xl border border-primary/20 shadow-[0_10px_40px_rgba(255,150,50,0.1)] mt-8 mb-4">
                  
                  {/* Play Button */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlay}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-10 cursor-pointer interactive group shadow-[0_0_30px_rgba(255,150,50,0.2)] relative"
                  >
                    <div className="absolute inset-0 rounded-full bg-primary/30 scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-50 blur-xl z-0" />
                    {isPlaying ? (
                      <Pause className="w-8 h-8 md:w-10 md:h-10 text-primary relative z-10" />
                    ) : (
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-primary translate-x-1 relative z-10" />
                    )}
                  </motion.div>

                  {/* Cinematic Waveform */}
                  <div className="flex items-center gap-1 md:gap-1.5 h-16 w-full max-w-sm justify-center">
                    {[...Array(24)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: "4px" }}
                        animate={isPlaying ? { 
                          height: ["10%", "100%", "30%", "80%", "20%", "90%", "10%"],
                          opacity: [0.5, 1, 0.7, 1, 0.5]
                        } : { height: "4px", opacity: 0.3 }} 
                        transition={{ 
                          duration: 1.5 + Math.random(), 
                          repeat: Infinity, 
                          delay: Math.random() * 0.5, 
                          ease: "easeInOut" 
                        }} 
                        className="w-1 md:w-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,150,50,0.8)]"
                      />
                    ))}
                  </div>

                  <p className="mt-8 text-foreground/80 font-medium tracking-wide flex items-center gap-2">
                    {isPlaying ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,150,50,1)] animate-pulse" />
                        Playing Summary...
                      </>
                    ) : (
                      "Ready to Listen"
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </Layout>
  );
};

export default Summary;
