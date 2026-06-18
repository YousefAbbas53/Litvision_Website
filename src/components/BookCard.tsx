import { Link } from "react-router-dom";
import { Book } from "@/lib/books";
import { Star, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BookCover } from "./BookCover";
import { BASE_URL, getToken } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloading) return;

    const token = getToken();
    if (!token) {
      toast.error("Please login to download books.");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading("Preparing download...");
    try {
      const response = await fetch(`${BASE_URL}/books/${book.id}/download-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to download this book PDF.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Download failed.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Link to={`/book/${book.id}`}>
      <motion.div
        whileHover={{ scale: 1.08, y: -10 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group block glass-card rounded-xl overflow-hidden hover-lift cursor-pointer relative"
      >
        <div className="aspect-[3/4] overflow-hidden">
          <BookCover book={book} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>

        {/* Download button — visible on hover */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          title="Download PDF"
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-amber-500/80 hover:border-amber-500/40 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {book.title}
          </h3>

          <p className="text-sm text-muted-foreground mt-1">
            {book.author}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">
                {book.rating}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;