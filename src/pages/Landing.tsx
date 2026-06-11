import HeroSection from "@/components/landing/HeroSection";
import ProcessPipeline from "@/components/landing/ProcessPipeline";
import VideoFeature from "@/components/landing/VideoFeature";
import AudioFeature from "@/components/landing/AudioFeature";
import SummaryFeature from "@/components/landing/SummaryFeature";
import RecommendationSection from "@/components/landing/RecommendationSection";
import AIInteraction from "@/components/landing/AIInteraction";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Landing = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Interactive Parallax Background Overlay */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        animate={{
          x: mousePos.x * -30, // Moves opposite to mouse
          y: mousePos.y * -30,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      >
         <div className="absolute inset-[-10%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      </motion.div>

      <div className="relative z-10">
        <ThemeToggle />
        <HeroSection />
        <ProcessPipeline />
        <VideoFeature />
        <AudioFeature />
        <SummaryFeature />
        <RecommendationSection />
        <AIInteraction />
      </div>
    </div>
  );
};

export default Landing;
