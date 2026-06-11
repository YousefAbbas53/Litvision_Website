import React, { createContext, useContext, useState } from "react";

interface VoiceCloningContextType {
  clonedVoiceFile: File | null;
  clonedVoiceName: string | null;
  clonedVoiceDuration: number | null;
  clonedVoiceSize: string | null;
  isClonedVoiceActive: boolean;
  setVoiceData: (file: File, duration: number) => void;
  setClonedVoiceActive: (active: boolean) => void;
  clearVoiceData: () => void;
}

const VoiceCloningContext = createContext<VoiceCloningContextType | null>(null);

export const VoiceCloningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clonedVoiceFile, setClonedVoiceFile] = useState<File | null>(null);
  const [clonedVoiceName, setClonedVoiceName] = useState<string | null>(null);
  const [clonedVoiceDuration, setClonedVoiceDuration] = useState<number | null>(null);
  const [clonedVoiceSize, setClonedVoiceSize] = useState<string | null>(null);
  const [isClonedVoiceActive, setIsClonedVoiceActive] = useState<boolean>(false);

  const setVoiceData = (file: File, duration: number) => {
    setClonedVoiceFile(file);
    setClonedVoiceName(file.name);
    setClonedVoiceDuration(duration);
    
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
  };

  const setClonedVoiceActive = (active: boolean) => {
    setIsClonedVoiceActive(active);
  };

  const clearVoiceData = () => {
    setClonedVoiceFile(null);
    setClonedVoiceName(null);
    setClonedVoiceDuration(null);
    setClonedVoiceSize(null);
    setIsClonedVoiceActive(false);
  };

  return (
    <VoiceCloningContext.Provider
      value={{
        clonedVoiceFile,
        clonedVoiceName,
        clonedVoiceDuration,
        clonedVoiceSize,
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
