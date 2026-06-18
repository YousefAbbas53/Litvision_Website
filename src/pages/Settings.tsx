import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Eye, 
  Shield, 
  Globe, 
  Volume2, 
  User, 
  Monitor,
  Check,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type TabId = "account" | "notifications" | "narration" | "interface";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("narration");

  // State values that persist in localStorage
  const [emailNotif, setEmailNotif] = useState(() => localStorage.getItem("settings_email_notif") !== "false");
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => localStorage.getItem("settings_autoplay_audio") === "true");
  const [voiceRate, setVoiceRate] = useState(() => Number(localStorage.getItem("settings_voice_rate") || "1.0"));
  const [voicePitch, setVoicePitch] = useState(() => Number(localStorage.getItem("settings_voice_pitch") || "1.0"));
  const [compactLayout, setCompactLayout] = useState(() => localStorage.getItem("settings_compact_layout") === "true");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("settings_high_contrast") === "true");

  // Save changes on toggle
  const handleToggle = (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    localStorage.setItem(key, String(val));
    toast.success("Preference updated successfully!");
  };

  const handleSlider = (key: string, val: number, setter: (v: number) => void) => {
    setter(val);
    localStorage.setItem(key, String(val));
  };

  const handleResetAudio = () => {
    setVoiceRate(1.0);
    setVoicePitch(1.0);
    setAutoPlayAudio(false);
    localStorage.setItem("settings_voice_rate", "1.0");
    localStorage.setItem("settings_voice_pitch", "1.0");
    localStorage.setItem("settings_autoplay_audio", "false");
    toast.success("Audio settings restored to default.");
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-amber-500 animate-spin-slow" />
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8 items-start">
          {/* Tab Navigation Left */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide border-b md:border-b-0 border-border/40">
            {[
              { id: "narration", name: "AI Audio Narration", icon: Volume2 },
              { id: "account", name: "Account Profile", icon: User },
              { id: "notifications", name: "Notifications", icon: Bell },
              { id: "interface", name: "Interface Theme", icon: Monitor }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all shrink-0 interactive ${
                    activeTab === tab.id
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Settings Panel Right */}
          <div className="bg-card/40 border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl min-h-[400px] backdrop-blur-md relative overflow-hidden">
            {/* Corner ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {activeTab === "narration" && (
                <motion.div 
                  key="narration"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">AI Audio Narration</h3>
                    <p className="text-muted-foreground text-xs">Configure preferences for TTS book reading and custom cloned voice narration.</p>
                  </div>

                  <div className="space-y-5 border-t border-border/40 pt-5">
                    {/* Auto play toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-xl">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">Autoplay Audio</h4>
                        <p className="text-muted-foreground text-xs mt-1">Start book voice narration automatically when page loads.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={autoPlayAudio}
                          onChange={(e) => handleToggle("settings_autoplay_audio", e.target.checked, setAutoPlayAudio)} 
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {/* Speed slider */}
                    <div className="p-4 bg-muted/20 border border-border/40 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-foreground">Playback Speed</span>
                        <span className="font-mono text-amber-500">{voiceRate.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value={voiceRate}
                        onChange={(e) => handleSlider("settings_voice_rate", Number(e.target.value), setVoiceRate)}
                        className="w-full accent-amber-500 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Slow</span>
                        <span>Normal</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    {/* Pitch slider */}
                    <div className="p-4 bg-muted/20 border border-border/40 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-foreground">Voice Pitch</span>
                        <span className="font-mono text-amber-500">{voicePitch.toFixed(1)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.1" 
                        value={voicePitch}
                        onChange={(e) => handleSlider("settings_voice_pitch", Number(e.target.value), setVoicePitch)}
                        className="w-full accent-amber-500 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Deep Voice</span>
                        <span>Normal</span>
                        <span>High Pitch</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={handleResetAudio}
                      className="gap-2 text-xs font-semibold interactive"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Defaults
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === "account" && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">Account Profile</h3>
                    <p className="text-muted-foreground text-xs">Review your registered LITVISION membership details.</p>
                  </div>

                  <div className="space-y-4 border-t border-border/40 pt-5">
                    <div className="flex items-center gap-4 p-4 bg-muted/10 border border-border/30 rounded-xl">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-2xl font-bold font-serif shrink-0">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-base text-foreground">{user?.name || "LITVISION Reader"}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Active Reader Membership</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/20 border border-border/40 rounded-xl">
                        <span className="block text-xs uppercase tracking-wider text-muted-foreground">Display Name</span>
                        <span className="block mt-1 font-medium text-foreground text-sm">{user?.name || "N/A"}</span>
                      </div>
                      <div className="p-4 bg-muted/20 border border-border/40 rounded-xl">
                        <span className="block text-xs uppercase tracking-wider text-muted-foreground">Email Address</span>
                        <span className="block mt-1 font-medium text-foreground text-sm truncate">{user?.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div 
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">Notifications</h3>
                    <p className="text-muted-foreground text-xs">Manage your email alerts and system notifications.</p>
                  </div>

                  <div className="space-y-4 border-t border-border/40 pt-5">
                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-xl">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">Email Alerts</h4>
                        <p className="text-muted-foreground text-xs mt-1">Receive email digests for newly added recommended genres.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={emailNotif}
                          onChange={(e) => handleToggle("settings_email_notif", e.target.checked, setEmailNotif)} 
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-xl opacity-60">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">Browser Notifications</h4>
                        <p className="text-muted-foreground text-xs mt-1">Receive sound alerts when audio voice generation is completed.</p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">Locked</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "interface" && (
                <motion.div 
                  key="interface"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">Interface Customization</h3>
                    <p className="text-muted-foreground text-xs">Optimize site readability and visual presentation elements.</p>
                  </div>

                  <div className="space-y-4 border-t border-border/40 pt-5">
                    {/* Compact Mode toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-xl">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">Compact Library Layout</h4>
                        <p className="text-muted-foreground text-xs mt-1">Decrease card padding and grid sizes to view more books.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={compactLayout}
                          onChange={(e) => handleToggle("settings_compact_layout", e.target.checked, setCompactLayout)} 
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {/* High Contrast toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-xl">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">High Contrast Mode</h4>
                        <p className="text-muted-foreground text-xs mt-1">Increase contrast between background elements for accessibility.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={highContrast}
                          onChange={(e) => handleToggle("settings_high_contrast", e.target.checked, setHighContrast)} 
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
