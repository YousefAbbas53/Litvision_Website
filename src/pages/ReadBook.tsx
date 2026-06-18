import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { booksApi, apiBookToLocal, getToken, BASE_URL } from "@/lib/api";
import { getBookById } from "@/lib/books";
import type { Book } from "@/lib/books";
import {
  ArrowLeft,
  BookOpen,
  Maximize2,
  Minimize2,
  Loader2,
  HelpCircle,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { useSound } from "@/components/audio/SoundManager";
import { toast } from "sonner";

const ReadBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playHover } = useSound();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [book, setBook] = useState<Book | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasPdf, setHasPdf] = useState(false);

  // Load book info
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const apiBook = await booksApi.getBook(id);
        if (!cancelled) {
          const localBook = apiBookToLocal(apiBook);
          setBook(localBook);
          setHasPdf(apiBook.hasPdf ?? false);
        }
      } catch {
        const local = getBookById(id);
        if (!cancelled && local) {
          setBook(local);
          setHasPdf(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Load PDF as blob once we have book info
  useEffect(() => {
    if (!id || !book) return;
    if (!hasPdf) {
      setIsLoading(false);
      setPdfError("No PDF available for this book.");
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      setPdfError(null);
      try {
        const token = getToken();
        const response = await fetch(`${BASE_URL}/books/${id}/download-pdf`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error(`Failed to load PDF (${response.status})`);
        }

        const blob = await response.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(objectUrl);

        // Restore saved progress
        const saved = localStorage.getItem(`read_scroll_${id}`);
        if (saved) setScrollProgress(Number(saved));
      } catch (err: any) {
        if (!cancelled) {
          setPdfError(err?.message || "Could not load the PDF file.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, book, hasPdf]);

  // Track scroll progress from iframe
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;
      const saved = localStorage.getItem(`read_scroll_${id}`);
      if (saved) {
        const pct = Number(saved);
        const doc = iframeWindow.document.documentElement || iframeWindow.document.body;
        if (doc) {
          const scrollTop = (pct / 100) * (doc.scrollHeight - doc.clientHeight);
          iframeWindow.scrollTo(0, scrollTop);
        }
      }

      iframeWindow.addEventListener("scroll", () => {
        const doc = iframeWindow.document.documentElement || iframeWindow.document.body;
        if (!doc) return;
        const scrollTop = iframeWindow.scrollY || doc.scrollTop;
        const scrollHeight = doc.scrollHeight - doc.clientHeight;
        const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
        setScrollProgress(pct);
        localStorage.setItem(`read_scroll_${id}`, String(pct));
      });
    } catch {
      // Cross-origin restrictions (PDF.js viewer handles this)
    }
  }, [id]);

  const toggleFullscreen = () => {
    playHover();
    setIsFullscreen((f) => !f);
  };

  const handleDownload = async () => {
    if (!pdfBlobUrl || !book) return;
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.download = `${book.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloading PDF...");
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <BookOpen className="absolute inset-0 m-auto w-7 h-7 text-amber-500" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">Opening book...</p>
            <p className="text-muted-foreground text-sm mt-1">Fetching secure PDF</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-center p-6">
          <HelpCircle className="w-16 h-16 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Book Not Found</h2>
          <button onClick={() => navigate("/home")} className="mt-2 text-primary hover:underline text-sm font-medium">
            Go Back Home
          </button>
        </div>
      </Layout>
    );
  }

  const readerContent = (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
      {/* ── Top Header & Progress Bar ── */}
      <div className="w-full bg-card/90 backdrop-blur-md border-b border-border/80 relative shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => { playHover(); navigate(-1); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm hidden sm:inline">Back</span>
          </button>

          <div className="font-serif text-foreground font-semibold text-center truncate flex-1 px-2">
            {book.title}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-amber-500 font-bold hidden sm:inline">
              {scrollProgress}% Read
            </span>
            {pdfBlobUrl && (
              <>
                <button
                  onClick={() => window.open(pdfBlobUrl, "_blank")}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-full h-1 bg-border/40 absolute bottom-0 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
            initial={false}
            animate={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute top-0 bottom-0 w-6 bg-amber-400/40 blur-sm"
            animate={{ left: `${scrollProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* ── PDF Content Area ── */}
      <div className="flex-1 relative overflow-hidden">
        {pdfError ? (
          /* No PDF fallback — show book description nicely */
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
            <div className="max-w-md">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">PDF Not Available</h3>
              <p className="text-muted-foreground text-sm mb-6">{pdfError}</p>
              <div className="p-6 rounded-2xl bg-card border border-border/80 text-left">
                <h4 className="font-serif font-bold text-lg text-foreground mb-3">Book Description</h4>
                <p className="text-muted-foreground leading-relaxed text-sm">{book.description}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-medium hover:bg-amber-500/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        ) : (
          /* PDF iframe viewer */
          <iframe
            ref={iframeRef}
            src={pdfBlobUrl ? `${pdfBlobUrl}#view=FitH` : ""}
            onLoad={handleIframeLoad}
            className="w-full h-full border-none"
            title={`${book.title} PDF Viewer`}
            style={{ background: "transparent" }}
          />
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="shrink-0 h-9 px-6 bg-card/40 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground/60 z-20">
        <span className="flex items-center gap-1.5 font-serif italic">
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          Reading Session
        </span>
        <span>{book.author}</span>
        <span className="font-mono sm:inline hidden">{book.pages > 0 ? `${book.pages} pages` : "—"}</span>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[1000] bg-background w-full h-screen flex flex-col">
        {readerContent}
      </div>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {readerContent}
      </div>
    </Layout>
  );
};

export default ReadBook;
