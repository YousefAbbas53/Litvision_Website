import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SoundContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  playHover: () => void;
  playFlip: () => void;
  playCinematic: () => void;
};

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true); // Default muted so it doesn't alarm user
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Initialize AudioContext on first user interaction if not muted
  useEffect(() => {
    if (!isMuted && !audioCtx) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
    }
  }, [isMuted, audioCtx]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Give immediate feedback when enabling sound
    if (isMuted && audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  };

  const playHover = useCallback(() => {
    if (isMuted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch tick
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01); // Very quiet
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  }, [isMuted, audioCtx]);

  const playFlip = useCallback(() => {
    if (isMuted || !audioCtx) return;
    // Simulate page flip with filtered white noise
    const bufferSize = audioCtx.sampleRate * 0.2; // 200ms of noise
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.2);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05); // Fade in
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2); // Fade out

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(audioCtx.currentTime);
  }, [isMuted, audioCtx]);

  const playCinematic = useCallback(() => {
    if (isMuted || !audioCtx) return;
    // Deep cinematic bass drop
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 2); // Pitch drop

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.1); // Swell up
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3); // Long fade out

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 3);
  }, [isMuted, audioCtx]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playHover, playFlip, playCinematic }}>
      {children}

      {/* Global Mute/Unmute Float Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={toggleMute}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] z-[9999] backdrop-blur-md border border-white/10 transition-colors ${isMuted ? "bg-card/50 text-muted-foreground hover:bg-card/80" : "bg-primary/20 text-primary border-primary/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-primary/30"
          }`}
        title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
      >
        <AnimatePresence mode="wait">
          {isMuted ? (
            <motion.div key="muted" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <VolumeX className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="unmuted" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Volume2 className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </SoundContext.Provider>
  );
};
