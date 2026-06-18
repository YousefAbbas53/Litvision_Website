import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { getBookById } from "@/lib/books";
import type { Book } from "@/lib/books";
import { booksApi, videoApi, apiBookToLocal } from "@/lib/api";
import type { VideoScene } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Film, Wand2, X, CheckSquare, Loader2 } from "lucide-react";
import { useSound } from "@/components/audio/SoundManager";
import { toast } from "sonner";

// Fallback scenes if API unavailable
const SCENES_FALLBACK: VideoScene[] = [
  { id: 1, text: "The beginning of the journey, where everything was quiet and peaceful." },
  { id: 2, text: "A sudden realization hits the protagonist, changing the course of events." },
  { id: 3, text: "The climax of the chapter, filled with action and suspense." },
  { id: 4, text: "The settling dust and the aftermath of the intense encounter." },
];

const BookVideo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playCinematic, playHover } = useSound();
  const isRestoring = useRef(true);

  // Book state
  const [book, setBook] = useState<Book | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [bookError, setBookError] = useState<string | null>(null);

  // Video state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [scenes, setScenes] = useState<VideoScene[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Load book
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setIsBookLoading(true);
      setBookError(null);
      try {
        const apiBook = await booksApi.getBook(id);
        if (!cancelled) setBook(apiBookToLocal(apiBook));
      } catch {
        const local = getBookById(id);
        if (!cancelled) {
          if (local) {
            setBook(local);
          } else {
            setBookError("Book not found. Please go back and try again.");
          }
        }
      } finally {
        if (!cancelled) setIsBookLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (!id) return;
    const savedStateStr = localStorage.getItem(`ttv_state_${id}`);
    if (savedStateStr) {
      try {
        const state = JSON.parse(savedStateStr);
        if (state && Array.isArray(state.scenes) && state.scenes.length > 0) {
          setScenes(state.scenes);
          setSelectedScenes(Array.isArray(state.selectedScenes) ? state.selectedScenes : []);
          setPreviewId(state.previewId || null);
          setGeneratedVideoUrl(state.generatedVideoUrl || null);
          setGeneratedVideoId(state.generatedVideoId || null);
          const validStep = state.step === 1 || state.step === 2 || state.step === 3 ? state.step : 1;
          setStep(validStep as 1 | 2 | 3);

          if (state.isGenerating && state.generatedVideoId) {
            setIsGenerating(true);
          }
        }
      } catch (e) {
        console.error("Failed to parse saved video state:", e);
      }
    }
    setTimeout(() => {
      isRestoring.current = false;
    }, 100);
  }, [id]);

  // Persist state to localStorage on state change
  useEffect(() => {
    if (isRestoring.current || !id || scenes.length === 0) return;
    const state = {
      step,
      scenes,
      selectedScenes,
      previewId,
      generatedVideoUrl,
      generatedVideoId,
      isGenerating
    };
    localStorage.setItem(`ttv_state_${id}`, JSON.stringify(state));
  }, [id, step, scenes, selectedScenes, previewId, generatedVideoUrl, generatedVideoId, isGenerating]);

  // Poll server for video status when isGenerating is active
  useEffect(() => {
    if (!isGenerating || !generatedVideoId || !id) return;
    let cancelled = false;

    const pollInterval = setInterval(async () => {
      try {
        const videoRes = await videoApi.getVideo(generatedVideoId);
        if (cancelled) return;

        if (videoRes.status === "done" && videoRes.videoUrl) {
          setGeneratedVideoUrl(videoRes.videoUrl);
          setIsGenerating(false);
          setStep(3);
          toast.success("Cinematic Video generated successfully!");
          clearInterval(pollInterval);
        } else if (videoRes.status === "failed") {
          setIsGenerating(false);
          toast.error("Video generation failed. Please try again.");
          clearInterval(pollInterval);
        }
      } catch (e) {
        console.error("Error polling video status:", e);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
    };
  }, [isGenerating, generatedVideoId, id]);

  useEffect(() => {
    if (step === 3) {
      playCinematic();
    }
  }, [step, playCinematic]);

  // Step 1 → Extract scenes
  const handleExtractScenes = async () => {
    if (!id) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const result = await videoApi.previewVideo(id, 3);
      setPreviewId(result.previewId);

      const apiScenes = (result.scenes || []).map((s, idx) => ({
        id: idx + 1,
        sceneId: s.sceneId,
        text: s.sceneExcerpt || s.prompt,
      }));

      if (apiScenes.length > 0) {
        setScenes(apiScenes);
      } else {
        setScenes(SCENES_FALLBACK);
        setExtractError("Scene extraction returned no data — showing sample scenes.");
      }
    } catch (err: any) {
      console.warn("Video preview API failed, using fallback scenes:", err.message);
      setExtractError("Scene extraction unavailable — showing sample scenes.");
      setScenes(SCENES_FALLBACK);
    } finally {
      setIsExtracting(false);
      setStep(2);
    }
  };

  const handleSelectAll = () => {
    if (selectedScenes.length === scenes.length) {
      setSelectedScenes([]);
    } else {
      setSelectedScenes(scenes.map((s) => s.id));
    }
  };

  const toggleScene = (sceneId: number) => {
    if (selectedScenes.includes(sceneId)) {
      const remaining = selectedScenes.filter((id) => id !== sceneId);
      if (remaining.length === 0) {
        setSelectedScenes([]);
        return;
      }
      const sorted = [...remaining].sort((a, b) => a - b);
      let isContig = true;
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] !== 1) {
          isContig = false;
          break;
        }
      }
      if (isContig) {
        setSelectedScenes(remaining);
      } else {
        setSelectedScenes([]);
        toast.warning("Deselecting this would make your selection non-contiguous. Selection has been reset.");
      }
    } else {
      if (selectedScenes.length === 0) {
        setSelectedScenes([sceneId]);
        return;
      }
      const min = Math.min(...selectedScenes);
      const max = Math.max(...selectedScenes);
      if (sceneId === min - 1 || sceneId === max + 1) {
        setSelectedScenes((prev) => [...prev, sceneId]);
      } else {
        setSelectedScenes([]);
        toast.warning("You must select contiguous scenes only. Selection has been reset.");
      }
    }
  };

  // Step 2 → Generate video
  const handleGenerate = async () => {
    if (selectedScenes.length === 0 || !id) return;

    setIsGenerating(true);
    setGeneratedVideoUrl(null);
    try {
      const selectedSceneStringIds = scenes
        .filter((s) => selectedScenes.includes(s.id))
        .map((s) => s.sceneId)
        .filter(Boolean) as string[];

      const result = await videoApi.generateVideo(
        id,
        undefined,
        previewId || undefined,
        selectedSceneStringIds.length > 0 ? selectedSceneStringIds : undefined
      );

      if (result.videoUrl) setGeneratedVideoUrl(result.videoUrl);
      if (result.id) setGeneratedVideoId(result.id);
    } catch (err: any) {
      console.warn("Video generation API failed:", err.message);
      toast.error(err.message || "Failed to initiate video generation.");
    } finally {
      setIsGenerating(false);
      setStep(3);
    }
  };

  // ── Loading state ────────────────────────────────────────
  if (isBookLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </Layout>
    );
  }

  // ── Error / Not found state ──────────────────────────────
  if (!book || bookError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-center p-6">
          <Film className="w-16 h-16 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Book Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            {bookError || "We couldn't find this book. Please go back and try again."}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline" className="gap-2 mt-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  const videoSrc =
    generatedVideoUrl ||
    "https://www.w3schools.com/html/mov_bbb.mp4";

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

        <div className="mb-10 text-center animate-fade-in">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
            Book to Video
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert{" "}
            <span className="font-semibold text-primary">{book.title}</span>{" "}
            into a cinematic visual experience.
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
                <Film
                  className={`w-12 h-12 ${
                    isExtracting ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>

              <Button
                size="xl"
                variant="accent"
                className="gap-2 text-lg px-8"
                onClick={handleExtractScenes}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing script with AI...
                  </>
                ) : (
                  <>
                    Extract Scenes
                    <Wand2 className="w-5 h-5" />
                  </>
                )}
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
              {extractError && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm">
                  ⚠️ {extractError}
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl font-semibold">
                  Detected Scenes
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                  disabled={isGenerating}
                >
                  <CheckSquare className="w-4 h-4" />
                  {selectedScenes.length === scenes.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="grid gap-4 mb-8">
                {scenes.map((scene) => {
                  const isSelected = selectedScenes.includes(scene.id);
                  return (
                    <div
                      key={scene.id}
                      onClick={() => !isGenerating && toggleScene(scene.id)}
                      className={`p-5 rounded-xl border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,150,50,0.1)]"
                          : "border-border bg-card hover:border-primary/30"
                      } ${isGenerating ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} flex gap-4`}
                    >
                      <div
                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary mb-1">
                          Scene {scene.id}
                        </div>
                        <p className="text-foreground/90">{scene.text}</p>
                        {scene.imageUrl && (
                          <img
                            src={scene.imageUrl}
                            alt={`Scene ${scene.id}`}
                            className="mt-2 w-32 h-20 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                  {generatedVideoUrl && (
                    <Button
                      size="xl"
                      variant="outline"
                      className="gap-2 text-lg px-8 border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
                      onClick={() => setStep(3)}
                      disabled={isGenerating}
                    >
                      Watch Video
                      <Film className="w-5 h-5" />
                    </Button>
                  )}

                  <Button
                    size="xl"
                    variant="accent"
                    className="gap-2 text-lg px-8 w-full sm:w-auto animate-fade-in"
                    onClick={handleGenerate}
                    disabled={selectedScenes.length === 0 || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        {generatedVideoUrl ? "Regenerate Video" : "Generate Video"}
                        <Wand2 className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
                {selectedScenes.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Select at least one scene to generate.
                  </p>
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
                {/* Book Cover Flip */}
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
                    <h2 className="text-amber-100 font-serif text-4xl md:text-5xl font-bold drop-shadow-xl">
                      {book.title}
                    </h2>
                    <div className="w-20 h-1 bg-amber-500/50 mx-auto mt-6" />
                  </motion.div>
                </motion.div>

                {/* Inner Pages */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, rotateX: 5 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                  className="w-full h-full flex flex-col md:flex-row bg-[#fcf8f2] shadow-[0_0_80px_rgba(255,150,50,0.15)] rounded-xl overflow-hidden relative z-40"
                >
                  <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/20 to-transparent z-30 pointer-events-none hidden md:block" />

                  {/* Left: Video */}
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
                      src={videoSrc}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </motion.div>

                  {/* Right: Text */}
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                    className="w-full md:w-1/2 h-full p-8 md:p-16 overflow-y-auto relative scrollbar-hide shadow-[inset_20px_0_50px_rgba(0,0,0,0.02)] z-10"
                  >
                    <div className="max-w-prose mx-auto">
                      <span className="text-amber-700/60 font-serif italic text-sm tracking-widest uppercase">
                        Now Reading
                      </span>
                      <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 mt-3 mb-8 border-b-2 border-amber-900/10 pb-6 leading-tight">
                        {book.title}
                      </h2>

                      <div className="text-stone-700 leading-loose font-serif text-lg md:text-xl space-y-6">
                        <p className="first-letter:text-6xl md:first-letter:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-amber-800">
                          {book.description}
                        </p>
                        {selectedScenes.map((sceneId) => {
                          const scene = scenes.find((s) => s.id === sceneId);
                          if (!scene) return null;
                          return (
                            <p
                              key={sceneId}
                              className="transition-all hover:text-amber-900 border-l-2 border-transparent hover:border-amber-500 pl-4"
                            >
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
