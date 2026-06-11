import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  Check, 
  Play, 
  Pause, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Music, 
  FileAudio,
  ChevronRight,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceCloning } from "./VoiceCloningContext";
import { toast } from "sonner";
import { useSound } from "@/components/audio/SoundManager";

interface VoiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
}

export const VoiceSelectionModal: React.FC<VoiceSelectionModalProps> = ({ isOpen, onClose, bookId }) => {
  const navigate = useNavigate();
  const { playHover, playFlip } = useSound();
  const { 
    clonedVoiceFile, 
    clonedVoiceName, 
    clonedVoiceDuration, 
    clonedVoiceSize,
    setVoiceData, 
    setClonedVoiceActive 
  } = useVoiceCloning();

  // Voice selection states
  const [selectedOption, setSelectedOption] = useState<"default" | "custom">("default");
  
  // Custom voice upload states
  const [file, setFile] = useState<File | null>(null);
  const [fileDuration, setFileDuration] = useState<number | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Preview player states
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load previous voice metadata if available in session context
  useEffect(() => {
    if (clonedVoiceFile) {
      setFile(clonedVoiceFile);
      setFileDuration(clonedVoiceDuration);
      setFileSizeStr(clonedVoiceSize);
      // Clean up previous URL if any
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(clonedVoiceFile));
    }
  }, [clonedVoiceFile]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle Play/Pause for voice preview
  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingPreview) {
        audioRef.current.play().catch(e => {
          console.error("Audio preview failed to play:", e);
          setIsPlayingPreview(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingPreview]);

  if (!isOpen) return null;

  // Audio duration decoder using Web Audio API
  const decodeDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        audioCtx.decodeAudioData(
          arrayBuffer,
          (buffer) => {
            audioCtx.close();
            resolve(buffer.duration);
          },
          (err) => {
            audioCtx.close();
            reject(new Error("Unable to read audio file metadata. Please make sure it is a valid, uncorrupted WAV or MP3 audio file."));
          }
        );
      };
      
      reader.onerror = () => {
        audioCtx.close();
        reject(new Error("Failed to read the file."));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Helper to format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Process the uploaded file
  const handleFile = async (selectedFile: File) => {
    setError(null);
    setIsPlayingPreview(false);
    
    // 1. Check file type
    const isWav = selectedFile.type === "audio/wav" || selectedFile.name.endsWith(".wav");
    const isMp3 = selectedFile.type === "audio/mpeg" || selectedFile.name.endsWith(".mp3");
    
    if (!isWav && !isMp3) {
      setError("Supported formats are .wav or .mp3 only.");
      return;
    }

    // 2. Check file size
    if (selectedFile.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    setIsDecoding(true);
    try {
      // 3. Decode duration
      const duration = await decodeDuration(selectedFile);
      
      // 4. Validate duration (recommended 5-10s)
      if (duration < 5 || duration > 10) {
        setError(`Audio duration must be between 5 and 10 seconds. Your file is ${duration.toFixed(1)} seconds.`);
        setIsDecoding(false);
        return;
      }

      // 5. Successful validation - set states
      setFile(selectedFile);
      setFileDuration(duration);
      setFileSizeStr(formatSize(selectedFile.size));
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(selectedFile));
      
      toast.success("Voice sample validated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to parse audio file.");
    } finally {
      setIsDecoding(false);
    }
  };

  // File picker handlers
  const onFileSelectClick = () => {
    playHover();
    fileInputRef.current?.click();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Action Continue
  const handleContinue = async () => {
    playFlip();
    if (selectedOption === "default") {
      setClonedVoiceActive(false);
      onClose();
      navigate(`/tts/${bookId}`);
    } else {
      if (!file || !fileDuration) {
        setError("Please upload a valid voice sample first.");
        return;
      }

      setIsUploading(true);
      
      // Generic future-ready loading state. This is where a real fetch call to XTTS / Voice Cloning API would go.
      // We pass the actual standard File object to our context state.
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API network latency
        setVoiceData(file, fileDuration);
        setClonedVoiceActive(true);
        setIsUploading(false);
        onClose();
        navigate(`/tts/${bookId}`);
        toast.success("Custom Voice applied successfully!");
      } catch (e) {
        setIsUploading(false);
        setError("Failed to process voice cloning API request.");
      }
    }
  };

  const reusePreviousVoice = () => {
    playHover();
    if (clonedVoiceFile && clonedVoiceDuration && clonedVoiceSize) {
      setFile(clonedVoiceFile);
      setFileDuration(clonedVoiceDuration);
      setFileSizeStr(clonedVoiceSize);
      setSelectedOption("custom");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(clonedVoiceFile));
      toast.success("Loaded previously uploaded voice sample.");
    }
  };

  const triggerClose = () => {
    playHover();
    setIsPlayingPreview(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={triggerClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10 overflow-hidden text-foreground flex flex-col max-h-[90vh]"
      >
        {/* Decorative corner lights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={triggerClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors interactive z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            Choose Your Narration Voice
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            Use the default voice or upload a short voice sample to create a personalized narration experience.
          </p>
        </div>

        {/* Form Error Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Options */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-6 scrollbar-hide py-1">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Option 1: Default Voice Card */}
            <div
              onClick={() => { playHover(); setSelectedOption("default"); }}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer interactive relative group flex flex-col justify-between ${
                selectedOption === "default"
                  ? "bg-primary/5 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "bg-card/40 border-border/80 hover:border-primary/45 hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Volume2 className={`w-5 h-5 ${selectedOption === "default" ? "text-amber-500 animate-pulse" : "text-muted-foreground"}`} />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    selectedOption === "default" ? "border-amber-500 bg-amber-500 text-primary-foreground" : "border-muted"
                  }`}>
                    {selectedOption === "default" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">Default Voice</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Use the system's standard synthetic voice. Reliable, standard speed, and standard pronunciation.
                </p>
              </div>
              <div className="mt-6 text-sm font-semibold text-amber-500 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Select default</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Option 2: Custom Voice Card */}
            <div
              onClick={() => { playHover(); setSelectedOption("custom"); }}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer interactive relative group flex flex-col justify-between ${
                selectedOption === "custom"
                  ? "bg-primary/5 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "bg-card/40 border-border/80 hover:border-primary/45 hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className={`w-5 h-5 ${selectedOption === "custom" ? "text-amber-500" : "text-muted-foreground"}`} />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    selectedOption === "custom" ? "border-amber-500 bg-amber-500 text-primary-foreground" : "border-muted"
                  }`}>
                    {selectedOption === "custom" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">Upload Custom Voice</h3>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Upload a voice clip of yourself or another speaker. We will clone the voice characteristics dynamically.
                </p>
              </div>
              <div className="mt-6 text-sm font-semibold text-amber-500 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Configure cloning</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Upload & Preview Section for Custom Voice option */}
          <AnimatePresence>
            {selectedOption === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {/* Check if there's already a valid session-level voice file uploaded */}
                {clonedVoiceFile && !file && (
                  <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Previously Uploaded Voice Detected</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        File: {clonedVoiceName} ({clonedVoiceDuration?.toFixed(1)}s, {clonedVoiceSize})
                      </p>
                    </div>
                    <Button 
                      onClick={reusePreviousVoice}
                      variant="outline"
                      size="sm"
                      className="interactive text-xs self-start md:self-auto"
                    >
                      Use Previous Voice
                    </Button>
                  </div>
                )}

                {!file ? (
                  // Upload drag area
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={onFileSelectClick}
                    className={`border-2 border-dashed rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer interactive transition-colors relative ${
                      isDragOver
                        ? "border-amber-500 bg-primary/10"
                        : "border-border hover:border-amber-500/50 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileInputChange}
                      accept=".wav,.mp3"
                      className="hidden"
                    />

                    {isDecoding ? (
                      <div className="flex flex-col items-center py-4">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
                        <span className="text-sm text-foreground">Decoding audio sample metadata...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-base text-foreground mb-1">
                          Drop your voice sample here
                        </p>
                        <p className="text-muted-foreground text-xs md:text-sm">
                          or click to <span className="text-amber-500 font-medium">Select from your PC</span>
                        </p>
                        
                        {/* Mobile Action Button */}
                        <Button 
                          variant="accent" 
                          size="sm" 
                          className="mt-4 md:hidden w-full font-medium py-2 interactive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileSelectClick();
                          }}
                        >
                          Select Voice File
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  // File Preview & Metadata display state
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-4 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <FileAudio className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <span>Voice Sample Loaded Successfully</span>
                            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                          </p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-[250px] md:max-w-xs">
                            {file.name}
                          </p>
                        </div>
                      </div>

                      {/* Replace/Delete action */}
                      <button
                        onClick={() => {
                          playHover();
                          setFile(null);
                          setFileDuration(null);
                          setFileSizeStr(null);
                          setIsPlayingPreview(false);
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }}
                        className="text-xs font-semibold text-destructive hover:underline p-1 interactive"
                      >
                        Reset File
                      </button>
                    </div>

                    {/* Audio controller */}
                    <div className="bg-card/60 rounded-xl p-4 flex items-center gap-4 border border-border/50">
                      <button
                        onClick={() => {
                          playHover();
                          setIsPlayingPreview(!isPlayingPreview);
                        }}
                        className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-amber-500 flex items-center justify-center interactive transition-colors"
                      >
                        {isPlayingPreview ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 translate-x-[1px]" />
                        )}
                      </button>
                      
                      {/* Simple progress bar preview representation */}
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden relative">
                        {isPlayingPreview && (
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: fileDuration || 0, ease: "linear" }}
                            className="absolute top-0 bottom-0 left-0 bg-amber-500"
                          />
                        )}
                      </div>

                      <span className="text-xs font-mono text-muted-foreground">
                        {fileDuration ? `${fileDuration.toFixed(1)}s` : "--:--"}
                      </span>
                    </div>

                    {/* File Information Fields */}
                    <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                      <div>
                        <span className="block font-medium text-foreground">File Name:</span>
                        <span className="truncate block mt-0.5 font-mono">{file.name}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Duration:</span>
                        <span className="block mt-0.5">{fileDuration ? `${fileDuration.toFixed(1)} seconds` : "--"}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Size:</span>
                        <span className="block mt-0.5">{fileSizeStr || "--"}</span>
                      </div>
                    </div>

                    {previewUrl && (
                      <audio
                        ref={audioRef}
                        src={previewUrl}
                        onEnded={() => setIsPlayingPreview(false)}
                        className="hidden"
                      />
                    )}
                  </div>
                )}

                {/* Upload Guidelines */}
                <div className="mt-4 p-4 rounded-2xl bg-card border border-border/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-500/80" />
                    Recording Guidelines
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground block">Supported formats:</span>
                      .wav or .mp3 only
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">Recommended duration:</span>
                      5 to 10 seconds
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">Recording quality:</span>
                      Clear voice in quiet room
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">Speaker setting:</span>
                      Single speaker, no music/noise
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-border/40 flex justify-end gap-3 z-10">
          <Button
            variant="outline"
            onClick={triggerClose}
            className="interactive"
            disabled={isUploading}
          >
            Cancel
          </Button>
          
          <Button
            variant="accent"
            onClick={handleContinue}
            disabled={isUploading || isDecoding || (selectedOption === "custom" && !file)}
            className="min-w-[120px] gap-2 interactive relative"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-accent-foreground" />
                <span>Cloning...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 text-accent-foreground" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
