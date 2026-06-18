import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { getBookById } from "@/lib/books";
import type { Book } from "@/lib/books";
import { booksApi, summaryApi, apiBookToLocal } from "@/lib/api";
import { ArrowLeft, BookOpen, Layers, Loader2, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useSound } from "@/components/audio/SoundManager";

type SummaryView = "none" | "chapter" | "parts";

interface ChapterSummary {
  title: string;
  summary: string;
}

const Summary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playHover, playFlip } = useSound();
  const hasFetched = useRef(false);

  const [book, setBook] = useState<Book | null>(null);
  const [view, setView] = useState<SummaryView>("none");

  const [fullSummary, setFullSummary] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summarySource, setSummarySource] = useState<"ai" | "fallback" | null>(null);

  // Load book
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const apiBook = await booksApi.getBook(id);
        if (!cancelled) setBook(apiBookToLocal(apiBook));
      } catch {
        const local = getBookById(id);
        if (!cancelled && local) setBook(local);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Check if the book ID is a real GUID (user-uploaded) or a static seed
  const isGuid = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const buildFallbackChapters = (b: Book | null): ChapterSummary[] => {
    const desc = b?.description || "";
    const parts = desc.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const chunk = Math.max(1, Math.ceil(parts.length / 5));
    const titles = [
      "Introduction & Setting",
      "Rising Action",
      "Central Conflict",
      "Climax & Turning Point",
      "Resolution & Themes",
    ];
    return titles.map((title, i) => ({
      title: `Chapter ${i + 1}: ${title}`,
      summary:
        parts.slice(i * chunk, (i + 1) * chunk).join(". ").trim() + (parts.length > 0 ? "." : "") ||
        `This section of '${b?.title}' explores the key themes of ${title.toLowerCase()}.`,
    }));
  };

  const fetchSummary = async () => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;
    setIsSummaryLoading(true);
    setSummaryError(null);

    // For static/non-GUID books, skip the API entirely and use local fallback
    if (!isGuid(id)) {
      const fallbackChapters = buildFallbackChapters(book);
      const fallbackSummary = book
        ? `Summary of '${book.title}' by ${book.author}:\n\n${book.description}\n\nThis ${book.category} book by ${book.author} offers a compelling read across ${book.pages} pages.`
        : "Summary not available.";
      setFullSummary(fallbackSummary);
      setChapters(fallbackChapters);
      setSummarySource("fallback");
      setIsSummaryLoading(false);
      return;
    }

    try {
      // Call real summary API
      const res = await summaryApi.getSummary(id);

      // Set full summary text from API response
      setFullSummary(res.finalSummary || null);

      // Fetch chapter summaries from the returned URL
      let fetchedChapters: ChapterSummary[] = [];
      const chapUrl = res.chapterSummariesUrl || res.bigSummaryUrl;
      if (chapUrl) {
        try {
          const chapRes = await fetch(chapUrl);
          if (chapRes.ok) {
            const data = await chapRes.json();
            if (Array.isArray(data)) {
              fetchedChapters = data
                .map((c: any, i: number) => ({
                  title: c.title || c.Title || c.chapter_title || `Chapter ${i + 1}`,
                  summary: c.summary || c.Summary || c.content || c.text || "",
                }))
                .filter((c) => c.summary);
            } else if (typeof data === "object" && data !== null) {
              const arr = data.chapters || data.summaries || Object.values(data);
              if (Array.isArray(arr)) {
                fetchedChapters = (arr as any[])
                  .map((c: any, i: number) => ({
                    title: c.title || c.Title || `Chapter ${i + 1}`,
                    summary: c.summary || c.Summary || c.content || "",
                  }))
                  .filter((c) => c.summary);
              }
            }
          }
        } catch (e) {
          console.warn("Failed to fetch chapter summaries file:", e);
        }
      }

      if (fetchedChapters.length === 0) {
        fetchedChapters = buildFallbackChapters(book);
      }

      setChapters(fetchedChapters);
      setSummarySource("ai");
    } catch (err: any) {
      console.warn("Summary API failed:", err);
      // If it's a 404 or network error, use fallback gracefully
      const isMissingBook =
        err?.message?.includes("404") ||
        err?.message?.includes("not found") ||
        err?.message?.includes("Not Found");

      if (isMissingBook) {
        // Graceful fallback for books not in the database
        const fallbackChapters = buildFallbackChapters(book);
        const fallbackSummary = book
          ? `Summary of '${book.title}' by ${book.author}:\n\n${book.description}`
          : "Summary not available.";
        setFullSummary(fallbackSummary);
        setChapters(fallbackChapters);
        setSummarySource("fallback");
      } else {
        setSummarySource("fallback");
        setFullSummary(null);
        setChapters([]);
        setSummaryError(
          err?.message && err.message !== "Failed to fetch"
            ? err.message
            : "Could not connect to the AI summary service. Please check your connection and try again."
        );
      }
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleSetView = (newView: SummaryView) => {
    if (view !== newView) {
      playFlip();
      setView(newView);
      fetchSummary();
    } else {
      setView("none");
    }
  };

  const handleRetry = () => {
    hasFetched.current = false;
    setSummaryError(null);
    setSummarySource(null);
    setFullSummary(null);
    setChapters([]);
    fetchSummary();
  };

  if (!book && !id) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-lg text-muted-foreground">Summary not found</p>
        </div>
      </Layout>
    );
  }

  const displaySummary = fullSummary || book?.description || "";

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen">
        <button
          onClick={() => navigate(-1)}
          onMouseEnter={() => playHover()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors interactive"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-foreground">
            {book?.title || "Loading..."}
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">{book?.author}</p>

          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium tracking-wider uppercase text-primary">
              AI-Powered Summary
            </span>
          </div>

          <p className="leading-relaxed text-foreground opacity-90 text-lg md:text-xl font-light border-l-2 border-primary/30 pl-4 mb-10">
            {displaySummary}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pb-6 border-b border-border/50">
            <button
              onClick={() => handleSetView("chapter")}
              onMouseEnter={() => playHover()}
              className={`w-full sm:w-auto group relative px-6 py-3 border shadow-md rounded-full flex items-center justify-center gap-3 transition-all duration-300 interactive ${
                view === "chapter"
                  ? "bg-amber-500/10 border-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
                  : "bg-card border-border hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:border-amber-500/50 hover:bg-amber-500/5"
              }`}
            >
              {isSummaryLoading && (view === "chapter" || view === "none") ? (
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin relative z-10" />
              ) : (
                <BookOpen
                  className={`w-5 h-5 transition-colors relative z-10 ${
                    view === "chapter" ? "text-amber-500" : "text-amber-500/70 group-hover:text-amber-500"
                  }`}
                />
              )}
              <span
                className={`font-medium transition-colors relative z-10 ${
                  view === "chapter" ? "text-amber-500" : "text-foreground group-hover:text-amber-500"
                }`}
              >
                By Chapter
              </span>
            </button>

            <button
              onClick={() => handleSetView("parts")}
              onMouseEnter={() => playHover()}
              className={`w-full sm:w-auto group relative px-6 py-3 border shadow-md rounded-full flex items-center justify-center gap-3 transition-all duration-300 interactive ${
                view === "parts"
                  ? "bg-blue-500/10 border-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.2)]"
                  : "bg-card border-border hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] hover:border-blue-500/50 hover:bg-blue-500/5"
              }`}
            >
              {isSummaryLoading && (view === "parts" || view === "none") ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin relative z-10" />
              ) : (
                <Layers
                  className={`w-5 h-5 transition-colors relative z-10 ${
                    view === "parts" ? "text-blue-500" : "text-blue-500/70 group-hover:text-blue-500"
                  }`}
                />
              )}
              <span
                className={`font-medium transition-colors relative z-10 ${
                  view === "parts" ? "text-blue-500" : "text-foreground group-hover:text-blue-500"
                }`}
              >
                Full Summary
              </span>
            </button>
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            {/* Loading state */}
            {isSummaryLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Generating AI summary...</p>
                <p className="text-muted-foreground/60 text-xs">This may take 15–30 seconds</p>
              </motion.div>
            )}

            {/* Error state */}
            {!isSummaryLoading && summaryError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10 gap-4"
              >
                <AlertCircle className="w-10 h-10 text-amber-500" />
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {summaryError}
                </p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm font-medium hover:bg-amber-500/20 transition-colors interactive"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </motion.div>
            )}

            {/* By Chapter view */}
            {!isSummaryLoading && !summaryError && view === "chapter" && (
              <motion.div
                key="chapter"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                {chapters.length > 0 ? (
                  <div className="space-y-4 pt-8 pb-4">
                    {summarySource === "ai" && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-emerald-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        AI-generated chapter breakdown
                      </div>
                    )}
                    {chapters.map((chap, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="group p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-amber-500/30 transition-all duration-300"
                      >
                        <h3 className="font-bold text-lg md:text-xl text-foreground mb-2 flex items-center gap-2">
                          <span className="text-amber-500 text-sm font-mono">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {chap.title.includes(":") ? chap.title.split(":")[1]?.trim() : chap.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed pl-6 border-l border-amber-500/20">
                          {chap.summary}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground text-sm">
                      Chapter breakdown is not available for this book yet.
                    </p>
                    <p className="text-muted-foreground/60 text-xs mt-2">
                      The AI is still processing the book chapters.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Full Summary view */}
            {!isSummaryLoading && !summaryError && view === "parts" && (
              <motion.div
                key="parts"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="pt-8 pb-4">
                  {summarySource === "ai" && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-emerald-500 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      AI-generated full summary
                    </div>
                  )}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                      <Layers className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-xl mb-4 text-foreground">Complete Summary</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                      {fullSummary || book?.description || "No full summary available."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Summary;
