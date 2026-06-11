import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TextSelect, BookOpen, Layers } from "lucide-react";

const textToType = "LITVISION AI analyzes the entire manuscript, extracting key themes, character arcs, and critical plot points to deliver a comprehensive summary without spoilers.";

const SummaryFeature = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isTyping && displayedText.length < textToType.length) {
      // simulate realistic AI streaming (chunks of text, varying speeds)
      const randomDelay = Math.random() > 0.8 ? Math.random() * 80 + 20 : 15;
      timeout = setTimeout(() => {
        setDisplayedText(textToType.slice(0, displayedText.length + 1));
      }, randomDelay);
    }
    return () => clearTimeout(timeout);
  }, [displayedText, isTyping]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsTyping(true);
        }
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Highlight bolded conceptual words
  const highlightKeywords = (text: string) => {
    const keywords = ["LITVISION AI", "key themes", "character arcs", "comprehensive summary"];
    let highlightedText = text;
    keywords.forEach((kw) => {
      if (highlightedText.includes(kw)) {
        highlightedText = highlightedText.replace(
          kw,
          `<span class="text-primary font-semibold glow-text">${kw}</span>`
        );
      }
    });
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <section className="py-24 relative bg-background" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-serif font-bold mb-4 text-foreground">
            Intelligent <span className="text-amber-500 glow-text">Distillation</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Short on time? Let our AI read the book for you. We generate an intelligent, structured summary dynamically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/summary/chapter')}
              className="group relative px-6 py-3 bg-card border border-border shadow-lg rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:border-amber-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <BookOpen className="w-5 h-5 text-amber-500 relative z-10" />
              <span className="font-medium text-foreground relative z-10">By Chapter</span>
            </button>

            <button
              onClick={() => navigate('/summary/parts')}
              className="group relative px-6 py-3 bg-card border border-border shadow-lg rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] hover:border-blue-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Layers className="w-5 h-5 text-blue-500 relative z-10" />
              <span className="font-medium text-foreground relative z-10">By Parts</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-card/50 backdrop-blur-md rounded-2xl p-8 border border-border shadow-2xl"
        >
          {/* Terminal styling header */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <TextSelect className="text-amber-500 w-5 h-5" />
            <span className="text-sm font-mono text-muted-foreground">AI_Summary_Generator.exe</span>
          </div>

          <div className="min-h-[120px] font-sans text-lg text-card-foreground leading-relaxed relative">
            {highlightKeywords(displayedText)}
            {isTyping && (
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className={`inline-block w-2 h-5 bg-amber-500 ml-1 translate-y-1 ${displayedText.length === textToType.length ? 'opacity-50' : ''}`}
              />
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default SummaryFeature;
