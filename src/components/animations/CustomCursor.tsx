import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Feather } from "lucide-react";
import { useSound } from "@/components/audio/SoundManager";

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { playHover } = useSound();

  useEffect(() => {
    // Detect touch devices
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Foolproof edge detection to hide cursor when leaving window
      if (
        e.clientX <= 5 ||
        e.clientY <= 5 ||
        e.clientX >= window.innerWidth - 5 ||
        e.clientY >= window.innerHeight - 5
      ) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("interactive")
      ) {
        setIsHovering((prev) => {
           if (!prev) playHover();
           return true;
        });
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", () => setIsVisible(false));
    document.addEventListener("mouseenter", () => setIsVisible(true));

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", () => setIsVisible(false));
      document.removeEventListener("mouseenter", () => setIsVisible(true));
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Main Quill / Feather Icon */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] text-foreground dark:text-white mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isVisible ? (isHovering ? 1.5 : 1) : 0,
          opacity: isVisible ? 1 : 0,
          rotate: isHovering ? -15 : 0,
        }}
        transition={{ type: "spring", stiffness: 800, damping: 25, mass: 0.2 }}
      >
        <Feather className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </motion.div>
      
      {/* Outer Glow / Hover state highlight */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border-2 border-foreground/20 rounded-full pointer-events-none z-[9998] mix-blend-difference"
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
          scale: isVisible ? (isHovering ? 1.2 : 0.5) : 0,
          opacity: isVisible ? (isHovering ? 1 : 0) : 0,
          backgroundColor: isHovering ? "rgba(255,255,255,0.1)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      />

      {/* Trailing Magic Glow */}
      <motion.div
        className="fixed top-0 left-0 w-24 h-24 bg-primary/20 rounded-full pointer-events-none z-[9997] blur-3xl mix-blend-screen dark:mix-blend-lighten"
        animate={{
          x: mousePosition.x - 48,
          y: mousePosition.y - 48,
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 1 }}
      />
    </>
  );
};

export default CustomCursor;
