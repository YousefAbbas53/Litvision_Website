import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getBookById } from "@/lib/books";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

// Generate mock pages based on the book's description to simulate a real reading experience
const generateMockPages = (description: string, count: number = 20) => {
  const pages = [];
  const words = description.split(" ");
  
  for (let i = 0; i < count; i++) {
    // Generate some random looking paragraphs using the book description text
    const p1 = words.slice(0, Math.floor(words.length / 2)).join(" ");
    const p2 = words.slice(Math.floor(words.length / 2)).join(" ");
    
    pages.push(`
      Chapter ${Math.floor(i / 4) + 1}
      <br/><br/>
      ${p1} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      <br/><br/>
      ${p2} Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `);
  }
  return pages;
};

const ReadBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const book = getBookById(id || "");
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 1 index = 2 pages (Left + Right)
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (book) {
      setPages(generateMockPages(book.description, 16));
    }
  }, [book]);

  const maxIndex = Math.ceil(pages.length / 2) - 1;
  const progressPercent = pages.length > 0 ? (currentPageIndex / maxIndex) * 100 : 0;

  const handleNext = useCallback(() => {
    if (currentPageIndex < maxIndex) setCurrentPageIndex(prev => prev + 1);
  }, [currentPageIndex, maxIndex]);

  const handlePrev = useCallback(() => {
    if (currentPageIndex > 0) setCurrentPageIndex(prev => prev - 1);
  }, [currentPageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h2 className="font-serif text-2xl font-bold mb-4">Book Not Found</h2>
        <button onClick={() => navigate("/home")} className="text-primary hover:underline">Go Back Home</button>
      </div>
    );
  }

  const leftPageContent = pages[currentPageIndex * 2];
  const rightPageContent = pages[currentPageIndex * 2 + 1];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/20 transition-colors duration-500">
      
      {/* Top Header & Progress */}
      <div className="w-full fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Library</span>
          </button>
          
          <div className="font-serif text-foreground font-medium">
            {book.title}
          </div>
          
          <div className="w-20 text-right text-xs text-muted-foreground font-mono">
            {Math.round(progressPercent)}%
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-border absolute bottom-0">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Book Container */}
      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 relative">
        
        {/* Navigation Overlays */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/6 md:w-32 z-40 cursor-pointer flex items-center justify-start px-4 group"
          onClick={handlePrev}
        >
          {currentPageIndex > 0 && (
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/6 md:w-32 z-40 cursor-pointer flex items-center justify-end px-4 group"
          onClick={handleNext}
        >
          {currentPageIndex < maxIndex && (
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* The Open Book */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentPageIndex}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-5xl aspect-[3/4] md:aspect-[2/1.3] flex flex-col md:flex-row shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] rounded-sm bg-card relative"
          >
            {/* Center Crease / Spine (Desktop visible) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 dark:via-black/40 to-transparent z-10 pointer-events-none hidden md:block" />

            {/* Left Page */}
            <div className="w-full md:w-1/2 h-full p-8 md:p-14 lg:p-20 overflow-y-auto scrollbar-hide flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
              {leftPageContent ? (
                <div 
                  className="font-serif text-lg lg:text-xl leading-[2.2] text-card-foreground"
                  dangerouslySetInnerHTML={{ __html: leftPageContent }}
                />
              ) : null}
              <div className="text-center font-mono text-xs text-muted-foreground mt-8">
                {currentPageIndex * 2 + 1}
              </div>
            </div>

            {/* Right Page */}
            <div className="w-full md:w-1/2 h-full p-8 md:p-14 lg:p-20 overflow-y-auto scrollbar-hide flex flex-col justify-between">
              {rightPageContent ? (
                <div 
                  className="font-serif text-lg lg:text-xl leading-[2.2] text-card-foreground"
                  dangerouslySetInnerHTML={{ __html: rightPageContent }}
                />
              ) : null}
              <div className="text-center font-mono text-xs text-muted-foreground mt-8">
                {currentPageIndex * 2 + 2}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ReadBook;
