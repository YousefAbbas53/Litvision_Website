import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { getBookById } from "@/lib/books";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Film, Wand2, X, CheckSquare } from "lucide-react";
import { useSound } from "@/components/audio/SoundManager";

// Mock scenes data
const SCENES_MOCK = [
  { id: 1, text: "The beginning of the journey, where everything was quiet and peaceful." },
  { id: 2, text: "A sudden realization hits the protagonist, changing the course of events." },
  { id: 3, text: "The climax of the chapter, filled with action and suspense." },
  { id: 4, text: "The settling dust and the aftermath of the intense encounter." }
];

const BookVideo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const book = getBookById(id || "");
  const { playCinematic } = useSound();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);

  useEffect(() => {
    if (step === 3) {
      playCinematic();
    }
  }, [step, playCinematic]);

  if (!book) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Book Not Found
            </h2>
            <Button onClick={() => navigate("/home")}>Go Back Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleExtractScenes = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setStep(2);
    }, 2000);
  };

  const handleSelectAll = () => {
    if (selectedScenes.length === SCENES_MOCK.length) {
      setSelectedScenes([]);
    } else {
      setSelectedScenes(SCENES_MOCK.map((s) => s.id));
    }
  };

  const toggleScene = (sceneId: number) => {
    setSelectedScenes((prev) =>
      prev.includes(sceneId)
        ? prev.filter((id) => id !== sceneId)
        : [...prev, sceneId]
    );
  };

  const handleGenerate = () => {
    if (selectedScenes.length === 0) return;
    setStep(3);
  };

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto min-h-[80vh]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
            Book to Video
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert <span className="font-semibold text-primary">{book.title}</span> into a cinematic visual experience.
          </p>
        </div>

        {/* Step 1: Extract Scenes */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-32 h-32 rounded-full bg-card border border-border flex items-center justify-center mb-8 shadow-lg relative">
                {isExtracting && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                )}
                <Film className={`w-12 h-12 ${isExtracting ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              <Button
                size="xl"
                variant="accent"
                className="gap-2 text-lg px-8"
                onClick={handleExtractScenes}
                disabled={isExtracting}
              >
                {isExtracting ? "Analyzing script..." : "Extract Scenes"}
                {!isExtracting && <Wand2 className="w-5 h-5" />}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Scene Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl font-semibold">Detected Scenes</h3>
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="gap-2">
                  <CheckSquare className="w-4 h-4" />
                  {selectedScenes.length === SCENES_MOCK.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="grid gap-4 mb-8">
                {SCENES_MOCK.map((scene) => {
                  const isSelected = selectedScenes.includes(scene.id);
                  return (
                    <div
                      key={scene.id}
                      onClick={() => toggleScene(scene.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,150,50,0.1)]"
                          : "border-border bg-card hover:border-primary/30"
                      } flex gap-4`}
                    >
                      <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                        {isSelected && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary mb-1">Scene {scene.id}</div>
                        <p className="text-foreground/90">{scene.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center flex-col items-center">
                 <Button
                  size="xl"
                  variant="accent"
                  className="gap-2 text-lg px-12"
                  onClick={handleGenerate}
                  disabled={selectedScenes.length === 0}
                >
                  Generate Video
                  <Film className="w-5 h-5" />
                </Button>
                {selectedScenes.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-3">Select at least one scene to generate.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Cinematic Portal */}
        <AnimatePresence>
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { delay: 0.5 } }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 md:p-10 perspective-[2500px]"
            >
              <button
                onClick={() => setStep(2)}
                className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 p-3 rounded-full z-[110] transition-colors"
                title="Close Portal"
              >
                <X size={28} />
              </button>

              <div className="relative w-full max-w-6xl h-[85vh] flex justify-center items-center">

                {/* The Book Cover (Flips Open) */}
                <motion.div
                  initial={{ rotateY: 0, zIndex: 50, opacity: 1 }}
                  animate={{ rotateY: -160, opacity: [1, 1, 0] }}
                  exit={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  style={{ transformOrigin: "left" }}
                  className="absolute left-1/2 w-1/2 h-full bg-gradient-to-r from-amber-950 to-amber-800 border-r-4 border-amber-900/50 rounded-r-2xl shadow-[20px_0_50px_rgba(0,0,0,0.8)] z-50 flex items-center justify-center p-12"
                >
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-center"
                  >
                    <h2 className="text-amber-100 font-serif text-4xl md:text-5xl font-bold drop-shadow-xl">{book.title}</h2>
                    <div className="w-20 h-1 bg-amber-500/50 mx-auto mt-6" />
                  </motion.div>
                </motion.div>

                {/* The Inner Pages (Content) */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, rotateX: 5 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                  className="w-full h-full flex flex-col md:flex-row bg-[#fcf8f2] shadow-[0_0_80px_rgba(255,150,50,0.15)] rounded-xl overflow-hidden relative z-40"
                >
                  {/* Central Spine shadow */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/20 to-transparent z-30 pointer-events-none hidden md:block" />

                  {/* Left Side: Video */}
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    style={{ transformOrigin: "right" }}
                    className="w-full md:w-1/2 h-full bg-black flex items-center justify-center relative shadow-[inset_-20px_0_50px_rgba(0,0,0,0.5)] z-20"
                  >
                    <div className="absolute top-6 left-6 text-white/40 font-serif italic text-sm tracking-widest z-10 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      VISUAL PORTAL
                    </div>
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                      src={(book as any).videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </motion.div>

                  {/* Right Side: Text */}
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                    className="w-full md:w-1/2 h-full p-8 md:p-16 overflow-y-auto relative scrollbar-hide shadow-[inset_20px_0_50px_rgba(0,0,0,0.02)] z-10"
                  >
                    <div className="max-w-prose mx-auto">
                      <span className="text-amber-700/60 font-serif italic text-sm tracking-widest uppercase">Now Reading</span>
                      <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-8 border-b-2 border-amber-900/10 pb-6 leading-tight">
                        {book.title}
                      </h2>

                      <div className="text-stone-700 leading-loose font-serif text-lg md:text-xl space-y-6">
                        <p className="first-letter:text-6xl md:first-letter:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-amber-800">
                          {book.description}
                        </p>
                        {selectedScenes.map(id => {
                          const scene = SCENES_MOCK.find(s => s.id === id);
                          if (!scene) return null;
                          return (
                            <p key={id} className="transition-all hover:text-amber-900 border-l-2 border-transparent hover:border-amber-500 pl-4">
                              {scene.text}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default BookVideo;
