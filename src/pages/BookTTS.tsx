import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { getBookById } from "@/lib/books";
import type { Book } from "@/lib/books";
import { booksApi, ttsApi, apiBookToLocal } from "@/lib/api";
import { ArrowLeft, Play, Pause, RotateCcw, Loader2, Volume2, AlertCircle } from "lucide-react";
import { useSound } from "@/components/audio/SoundManager";
import { useVoiceCloning } from "@/components/audio/VoiceCloningContext";

const BookTTS = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playHover, playFlip } = useSound();
  const { isClonedVoiceActive, clonedVoiceUrl } = useVoiceCloning();

  // Book state
  const [book, setBook] = useState<Book | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);

  // TTS states
  const [ttsText, setTtsText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<"idle" | "generating" | "available" | "failed">("idle");
  const [ttsErrorMessage, setTtsErrorMessage] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [sentences, setSentences] = useState<string[]>([]);

  // Real-time seekable audio states
  const [realAudioDuration, setRealAudioDuration] = useState<number | null>(null);
  const [sentenceDurations, setSentenceDurations] = useState<number[]>([]);
  const [sentenceStarts, setSentenceStarts] = useState<number[]>([]);
  const [estimatedTotalDuration, setEstimatedTotalDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load book from API
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setIsBookLoading(true);
      try {
        const apiBook = await booksApi.getBook(id);
        if (!cancelled) setBook(apiBookToLocal(apiBook));
      } catch {
        const local = getBookById(id);
        if (!cancelled && local) setBook(local);
      } finally {
        if (!cancelled) setIsBookLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  // Load TTS text or initiate generation from API
  useEffect(() => {
    if (!id || !book) return;
    let cancelled = false;
    let pollInterval: any = null;

    const loadTts = async () => {
      setIsTtsLoading(true);
      setTtsErrorMessage(null);
      
      const savedStateStr = localStorage.getItem(`tts_state_${id}`);
      if (savedStateStr) {
        try {
          const parsed = JSON.parse(savedStateStr);
          if (parsed.status === "available" && parsed.audioUrl) {
            if (!cancelled) {
              setAudioUrl(parsed.audioUrl);
              setTtsStatus("available");
              setTtsText(book.description);
              setIsTtsLoading(false);
            }
            return;
          }
          
          if (parsed.status === "generating") {
            if (!cancelled) {
              setTtsStatus("generating");
            }
            
            // Immediately start polling
            pollInterval = setInterval(async () => {
              try {
                const checkRes = await ttsApi.getTtsText(id, parsed.voiceType || "preset_1");
                if (checkRes.status === "available" && checkRes.audioFileUrl) {
                  clearInterval(pollInterval);
                  if (!cancelled) {
                    setAudioUrl(checkRes.audioFileUrl);
                    setTtsStatus("available");
                    setTtsText(book.description);
                    localStorage.setItem(`tts_state_${id}`, JSON.stringify({
                      status: "available",
                      voiceType: parsed.voiceType,
                      voiceUrl: parsed.voiceUrl,
                      audioUrl: checkRes.audioFileUrl
                    }));
                  }
                } else if (checkRes.status === "failed") {
                  clearInterval(pollInterval);
                  if (!cancelled) {
                    setTtsStatus("failed");
                    setTtsErrorMessage("Failed to generate AI voice. Please try again.");
                    localStorage.removeItem(`tts_state_${id}`);
                  }
                }
              } catch (e) {
                console.error("Error polling TTS:", e);
              }
            }, 5000);
            setIsTtsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved tts state on load:", e);
        }
      }

      // Determine voice type — only use custom if we actually have the cloud URL
      const hasValidCustomVoice = isClonedVoiceActive && !!clonedVoiceUrl;
      const voiceType = hasValidCustomVoice ? "custom" : "preset_1";
      const voiceUrl = hasValidCustomVoice ? clonedVoiceUrl : undefined;

      try {
        setTtsStatus("generating");
        localStorage.setItem(`tts_state_${id}`, JSON.stringify({
          status: "generating",
          voiceType,
          voiceUrl
        }));
        
        // Trigger the AI pipeline
        const generateRes = await ttsApi.generateTts({
          bookId: id,
          voiceType,
          voiceUrl
        });
        
        if (generateRes.status === "available" && generateRes.audioFileUrl) {
          if (!cancelled) {
            setAudioUrl(generateRes.audioFileUrl);
            setTtsStatus("available");
            setTtsText(book.description);
            localStorage.setItem(`tts_state_${id}`, JSON.stringify({
              status: "available",
              voiceType,
              voiceUrl,
              audioUrl: generateRes.audioFileUrl
            }));
          }
        } else {
          // Poll for completion
          pollInterval = setInterval(async () => {
            try {
              const checkRes = await ttsApi.getTtsText(id, voiceType);
              if (checkRes.status === "available" && checkRes.audioFileUrl) {
                clearInterval(pollInterval);
                if (!cancelled) {
                  setAudioUrl(checkRes.audioFileUrl);
                  setTtsStatus("available");
                  setTtsText(book.description);
                  localStorage.setItem(`tts_state_${id}`, JSON.stringify({
                    status: "available",
                    voiceType,
                    voiceUrl,
                    audioUrl: checkRes.audioFileUrl
                  }));
                }
              } else if (checkRes.status === "failed") {
                clearInterval(pollInterval);
                if (!cancelled) {
                  setTtsStatus("failed");
                  setTtsErrorMessage("Failed to generate AI voice. Please try again.");
                  localStorage.removeItem(`tts_state_${id}`);
                }
              }
            } catch (e) {
              console.error("Error polling TTS:", e);
            }
          }, 5000);
        }
      } catch (err: any) {
        console.warn("TTS initialization failed, falling back to local SpeechSynthesis:", err);
        if (!cancelled) {
          setTtsText(book.description || "");
          setTtsStatus("available");
          localStorage.removeItem(`tts_state_${id}`);
        }
      } finally {
        if (!cancelled) setIsTtsLoading(false);
      }
    };

    loadTts();
    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [id, book, isClonedVoiceActive, clonedVoiceUrl]);

  // When TTS text is available, build sentences
  useEffect(() => {
    const textToUse = ttsText || book?.description || "";
    if (textToUse) {
      const splits = textToUse.match(/[^.!?]+[.!?]+(\s|$)/g) || [textToUse];
      setSentences(splits.map((s) => s.trim()).filter(Boolean));
    }
    synthRef.current = window.speechSynthesis;

    return () => {
      isCancelledRef.current = true;
      synthRef.current?.cancel();
      stopTimer();
    };
  }, [ttsText, book]);

  // Compute sentence starts + estimated total duration
  useEffect(() => {
    if (sentences.length > 0) {
      const getWordCount = (text: string) =>
        text.trim().split(/\s+/).filter(Boolean).length;
      const durations = sentences.map((s) => Math.max(2, getWordCount(s) * 0.45));
      let acc = 0;
      const starts = durations.map((d) => {
        const start = acc;
        acc += d;
        return start;
      });
      setSentenceDurations(durations);
      setSentenceStarts(starts);
      setEstimatedTotalDuration(acc);
    }
  }, [sentences]);

  // Sync seek/highlight for real audio player
  const handleAudioTimeUpdate = () => {
    if (audioPlayerRef.current) {
      const time = audioPlayerRef.current.currentTime;
      setCurrentTime(time);
      
      const activeIndex = sentenceStarts.findIndex((start, idx) => {
        const end = start + sentenceDurations[idx];
        return time >= start && time < end;
      });
      if (activeIndex !== -1 && activeIndex !== currentSentenceIndex) {
        setCurrentSentenceIndex(activeIndex);
      }
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioPlayerRef.current) {
      setRealAudioDuration(audioPlayerRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentSentenceIndex(-1);
    setCurrentTime(0);
  };

  // Timer for native fallback
  const startTimer = () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    lastUpdateRef.current = Date.now();

    const update = () => {
      if (isCancelledRef.current) return;
      const now = Date.now();
      const elapsed = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + elapsed;
        const durationToUse =
          realAudioDuration !== null ? realAudioDuration : estimatedTotalDuration;

        if (next >= durationToUse) {
          setIsPlaying(false);
          setCurrentSentenceIndex(-1);
          synthRef.current?.cancel();
          stopTimer();
          return 0;
        }

        if (
          currentSentenceIndex !== -1 &&
          sentenceStarts.length > currentSentenceIndex
        ) {
          const currentSentenceStart = sentenceStarts[currentSentenceIndex];
          const currentSentenceDuration = sentenceDurations[currentSentenceIndex];
          const currentSentenceEnd = currentSentenceStart + currentSentenceDuration;

          if (next >= currentSentenceEnd - 0.1) {
            return currentSentenceEnd - 0.1;
          }
        }
        return next;
      });

      timerRef.current = requestAnimationFrame(update);
    };

    timerRef.current = requestAnimationFrame(update);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  };

  const speakSentence = (index: number) => {
    if (!synthRef.current || isCancelledRef.current || index >= sentences.length) {
      if (index >= sentences.length) {
        setIsPlaying(false);
        setCurrentSentenceIndex(-1);
        stopTimer();
      }
      return;
    }

    setCurrentSentenceIndex(index);

    setCurrentTime((prev) => {
      if (sentenceStarts.length > index) {
        const start = sentenceStarts[index];
        const duration = sentenceDurations[index];
        if (prev < start || prev >= start + duration) {
          return start;
        }
      }
      return prev;
    });

    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    utterance.rate = 0.9;
    utterance.pitch = 0.95;

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        speakSentence(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      if (e.error !== "interrupted" && e.error !== "canceled") {
        setIsPlaying(false);
        stopTimer();
      }
    };

    synthRef.current.speak(utterance);
  };

  const togglePlay = () => {
    playFlip();

    if (audioUrl) {
      if (audioPlayerRef.current) {
        if (isPlaying) {
          audioPlayerRef.current.pause();
          setIsPlaying(false);
        } else {
          audioPlayerRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(e => {
            console.error("Audio playback error:", e);
          });
        }
      }
    } else {
      if (!synthRef.current) return;

      if (isPlaying) {
        isCancelledRef.current = true;
        synthRef.current.cancel();
        setIsPlaying(false);
        stopTimer();
      } else {
        isCancelledRef.current = false;
        setIsPlaying(true);

        let startIndex = currentSentenceIndex;
        if (startIndex < 0 || startIndex >= sentences.length) {
          startIndex = 0;
          setCurrentTime(0);
        }

        speakSentence(startIndex);
        startTimer();
      }
    }
  };

  const reset = () => {
    playHover();
    if (audioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentSentenceIndex(-1);
    } else {
      if (synthRef.current) {
        isCancelledRef.current = true;
        synthRef.current.cancel();
      }
      setIsPlaying(false);
      stopTimer();
      setCurrentTime(0);
      setCurrentSentenceIndex(-1);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || sentences.length === 0 || sentenceStarts.length === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const durationToUse =
      realAudioDuration !== null ? realAudioDuration : estimatedTotalDuration;
    const targetTime = percentage * durationToUse;

    let targetIdx = sentenceStarts.findIndex((start, idx) => {
      const end = start + sentenceDurations[idx];
      return targetTime >= start && targetTime <= end;
    });

    if (targetIdx === -1) {
      targetIdx = targetTime >= durationToUse ? sentences.length - 1 : 0;
    }

    if (audioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
        setCurrentSentenceIndex(targetIdx);
      }
    } else {
      setCurrentTime(targetTime);
      setCurrentSentenceIndex(targetIdx);

      if (isPlaying) {
        isCancelledRef.current = true;
        synthRef.current?.cancel();

        setTimeout(() => {
          isCancelledRef.current = false;
          speakSentence(targetIdx);
          lastUpdateRef.current = Date.now();
        }, 50);
      }
    }
  };

  if (isBookLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-muted-foreground">Book not found for TTS session</p>
        </div>
      </Layout>
    );
  }

  const durationToUse =
    realAudioDuration !== null ? realAudioDuration : estimatedTotalDuration;
  const progressPercent = durationToUse > 0 ? (currentTime / durationToUse) * 100 : 0;

  return (
    <Layout>
      <div className="p-4 md:p-6 min-h-screen relative flex flex-col">
        {/* HTML5 Audio Player */}
        {audioUrl && (
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        )}

        {/* Header / Back */}
        <button
          onClick={() => {
            if (audioPlayerRef.current) audioPlayerRef.current.pause();
            synthRef.current?.cancel();
            navigate(-1);
          }}
          onMouseEnter={playHover}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors self-start interactive z-10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Book</span>
        </button>

        {/* TTS Loading Indicator */}
        {isTtsLoading && ttsStatus !== "generating" && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Loading full book text...
          </div>
        )}

        {/* AI Voice cloning loading page */}
        {ttsStatus === "generating" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto my-12 p-8 bg-card border border-border/80 rounded-2xl shadow-xl">
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <Volume2 className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground text-center">AI Voice Generating</h3>
            <p className="text-muted-foreground text-center text-sm mt-3 leading-relaxed">
              We are processing your book narration. This takes around 15–45 seconds.
            </p>
            <div className="mt-6 flex gap-2 text-xs font-mono text-muted-foreground items-center bg-muted/50 px-4 py-2 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Status: Generating audio via AI pipeline</span>
            </div>
            {/* Cancel button */}
            <button
              onClick={() => {
                if (id) localStorage.removeItem(`tts_state_${id}`);
                navigate(`/book/${id}`);
              }}
              className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-full border border-destructive/40 text-destructive/80 hover:bg-destructive/10 hover:text-destructive text-sm font-medium transition-colors interactive"
            >
              <RotateCcw className="w-4 h-4" />
              Cancel &amp; Start Over
            </button>
          </div>
        )}


        {/* Failure state */}
        {ttsStatus === "failed" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto my-12 p-8 bg-card border border-destructive/20 rounded-2xl shadow-xl">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="font-serif text-2xl font-bold text-foreground text-center">Generation Failed</h3>
            <p className="text-destructive text-center text-sm mt-2 font-medium">
              {ttsErrorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-105 transition-all text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Interface Layout */}
        {ttsStatus !== "generating" && ttsStatus !== "failed" && (
          <div className="flex-1 max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Audio Visualization / Controls (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              {/* Cinematic Waveform Wrapper */}
              <div className="relative w-full aspect-square max-w-[400px] flex flex-col items-center justify-center bg-card/50 rounded-full border border-primary/10 shadow-[0_0_80px_rgba(255,150,50,0.05)]">
                <div
                  className={`absolute inset-0 rounded-full border border-primary/20 transition-all duration-1000 ${
                    isPlaying ? "scale-110 opacity-50" : "scale-100 opacity-20"
                  }`}
                />
                <div
                  className={`absolute inset-4 rounded-full border border-primary/30 transition-all duration-1000 delay-100 ${
                    isPlaying
                      ? "scale-105 opacity-30 animate-spin-slow"
                      : "scale-100 opacity-10"
                  }`}
                />

                {/* Play/Pause Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center z-10 cursor-pointer shadow-[0_0_30px_rgba(255,150,50,0.3)] group relative interactive"
                >
                  <div
                    className={`absolute inset-0 rounded-full bg-primary/20 blur-xl transition-all duration-700 ${
                      isPlaying ? "scale-150 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                  {isPlaying ? (
                    <Pause className="w-10 h-10 md:w-12 md:h-12 text-primary relative z-10" />
                  ) : (
                    <Play className="w-10 h-10 md:w-12 md:h-12 text-primary translate-x-1 relative z-10" />
                  )}
                </motion.div>

                {/* Waveform Bars */}
                <div className="absolute bottom-16 left-0 right-0 flex items-end justify-center gap-1 md:gap-1.5 h-20 px-12 z-0">
                  {[...Array(28)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: "4px" }}
                      animate={
                        isPlaying
                          ? {
                              height: ["15%", "100%", "40%", "80%", "20%", "90%", "15%"],
                              opacity: [0.4, 1, 0.6, 1, 0.4],
                            }
                          : { height: "4px", opacity: 0.2 }
                      }
                      transition={{
                        duration: 1.2 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 0.4,
                        ease: "easeInOut",
                      }}
                      className="w-1 md:w-[6px] bg-primary rounded-full shadow-[0_0_10px_rgba(255,150,50,0.6)]"
                    />
                  ))}
                </div>
              </div>

              {/* Controls & Progress */}
              <div className="mt-12 w-full max-w-[350px]">
                {/* Voice Badge */}
                <div className="flex flex-col items-center gap-2 mb-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
                      isClonedVoiceActive
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isClonedVoiceActive ? "bg-amber-500 animate-pulse" : "bg-primary"
                      }`}
                    />
                    {isClonedVoiceActive ? "Custom Voice" : "Default Voice"}
                  </span>
                  
                  <button
                    onClick={() => {
                      localStorage.removeItem(`tts_state_${book.id}`);
                      navigate(-1);
                    }}
                    className="text-xs text-muted-foreground hover:text-amber-500 hover:underline transition-colors mt-1 interactive"
                  >
                    Change Voice Options
                  </button>
                </div>

                {/* Time Display */}
                <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-3 font-serif">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-primary">{formatTime(durationToUse)}</span>
                </div>

                {/* Progress Bar */}
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="h-2.5 w-full bg-secondary rounded-full relative mb-8 border border-border cursor-pointer interactive group hover:scale-[1.02] transition-transform"
                  title="Seek"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 shadow-md border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                    style={{ left: `calc(${progressPercent}% - 8px)` }}
                  />
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={reset}
                    className="p-3 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors interactive"
                    title="Restart"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Read-Along Book Text (Right) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="bg-[#fcf8f2] dark:bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_0_40px_rgba(255,150,50,0.05)] rounded-2xl p-8 md:p-12 min-h-[500px] border border-stone-200 dark:border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-8 w-px bg-stone-300 dark:bg-zinc-700/50 hidden md:block" />

                <div className="md:ml-6">
                  <h2 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100 mb-6 pb-4 border-b border-stone-300 dark:border-zinc-700">
                    {book.title}
                  </h2>

                  {isTtsLoading ? (
                    <div className="flex items-center gap-3 text-stone-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-serif italic">Loading text...</span>
                    </div>
                  ) : (
                    <div className="font-serif text-lg md:text-xl leading-loose text-stone-600 dark:text-stone-400">
                      {sentences.map((sentence, idx) => {
                        const isActive = idx === currentSentenceIndex;

                        return (
                          <motion.span
                            key={idx}
                            animate={{
                              color: isActive ? "#d97706" : "inherit",
                              backgroundColor: isActive
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(0,0,0,0)",
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className={`transition-colors rounded-md px-[2px] mx-[1px] ${
                              isActive
                                ? "font-semibold shadow-[0_0_15px_rgba(245,158,11,0.1)] outline outline-1 outline-amber-500/20"
                                : ""
                            }`}
                          >
                            {sentence}{" "}
                          </motion.span>
                        );
                      })}

                      {sentences.length === 0 && <p>Loading text...</p>}

                      <p className="mt-8 text-sm italic text-stone-400 dark:text-zinc-600">
                        {book.author} — Interactive Voice Playback
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookTTS;
