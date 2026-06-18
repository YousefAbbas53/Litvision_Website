import React, { createContext, useContext, useState } from "react";

interface VoiceCloningContextType {
  clonedVoiceFile: File | null;
  clonedVoiceName: string | null;
  clonedVoiceDuration: number | null;
  clonedVoiceSize: string | null;
  clonedVoiceUrl: string | null;
  isClonedVoiceActive: boolean;
  setVoiceData: (file: File, duration: number, url: string) => void;
  setClonedVoiceActive: (active: boolean) => void;
  clearVoiceData: () => void;
}

const VoiceCloningContext = createContext<VoiceCloningContextType | null>(null);

export const VoiceCloningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clonedVoiceFile, setClonedVoiceFile] = useState<File | null>(null);
  const [clonedVoiceName, setClonedVoiceName] = useState<string | null>(() => localStorage.getItem("cloned_voice_name"));
  const [clonedVoiceDuration, setClonedVoiceDuration] = useState<number | null>(() => {
    const d = localStorage.getItem("cloned_voice_duration");
    return d ? Number(d) : null;
  });
  const [clonedVoiceSize, setClonedVoiceSize] = useState<string | null>(() => localStorage.getItem("cloned_voice_size"));
  const [clonedVoiceUrl, setClonedVoiceUrl] = useState<string | null>(() => localStorage.getItem("cloned_voice_url"));
  const [isClonedVoiceActive, setIsClonedVoiceActive] = useState<boolean>(() => localStorage.getItem("cloned_voice_active") === "true");

  const setVoiceData = (file: File, duration: number, url: string) => {
    setClonedVoiceFile(file);
    setClonedVoiceName(file.name);
    setClonedVoiceDuration(duration);
    setClonedVoiceUrl(url);
    
    localStorage.setItem("cloned_voice_name", file.name);
    localStorage.setItem("cloned_voice_duration", String(duration));
    localStorage.setItem("cloned_voice_url", url);
    
    // Format size
    let sizeStr = "";
    if (file.size < 1024) {
      sizeStr = `${file.size} Bytes`;
    } else if (file.size < 1024 * 1024) {
      sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    } else {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }
    setClonedVoiceSize(sizeStr);
    localStorage.setItem("cloned_voice_size", sizeStr);
  };

  const setClonedVoiceActive = (active: boolean) => {
    setIsClonedVoiceActive(active);
    localStorage.setItem("cloned_voice_active", String(active));
  };

  const clearVoiceData = () => {
    setClonedVoiceFile(null);
    setClonedVoiceName(null);
    setClonedVoiceDuration(null);
    setClonedVoiceSize(null);
    setClonedVoiceUrl(null);
    setIsClonedVoiceActive(false);

    localStorage.removeItem("cloned_voice_name");
    localStorage.removeItem("cloned_voice_duration");
    localStorage.removeItem("cloned_voice_url");
    localStorage.removeItem("cloned_voice_size");
    localStorage.setItem("cloned_voice_active", "false");
  };

  return (
    <VoiceCloningContext.Provider
      value={{
        clonedVoiceFile,
        clonedVoiceName,
        clonedVoiceDuration,
        clonedVoiceSize,
        clonedVoiceUrl,
        isClonedVoiceActive,
        setVoiceData,
        setClonedVoiceActive,
        clearVoiceData,
      }}
    >
      {children}
    </VoiceCloningContext.Provider>
  );
};

export const useVoiceCloning = () => {
  const context = useContext(VoiceCloningContext);
  if (!context) {
    throw new Error("useVoiceCloning must be used within a VoiceCloningProvider");
  }
  return context;
};
