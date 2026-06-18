import { useState } from "react";
import type { Book } from "@/lib/books";

interface BookCoverProps {
  book: Book;
  className?: string;
}

const getCategoryColor = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("adventure")) return "from-amber-900 via-amber-800 to-orange-950";
  if (cat.includes("romance")) return "from-rose-900 via-rose-800 to-pink-950";
  if (cat.includes("mystery")) return "from-slate-900 via-slate-800 to-zinc-950";
  if (cat.includes("sci-fi") || cat.includes("science")) return "from-blue-900 via-blue-800 to-indigo-950";
  if (cat.includes("fantasy")) return "from-violet-900 via-violet-800 to-purple-950";
  if (cat.includes("self-help") || cat.includes("philosophy")) return "from-emerald-900 via-emerald-800 to-teal-950";
  if (cat.includes("history")) return "from-stone-900 via-stone-800 to-amber-950";
  return "from-neutral-900 via-neutral-800 to-stone-950";
};

const CssCover = ({ book }: { book: Book }) => {
  const gradient = getCategoryColor(book.category);
  return (
    <div
      className={`w-full h-full flex flex-col bg-gradient-to-br ${gradient} overflow-hidden relative select-none`}
      aria-label={book.title}
    >
      {/* Spine accent line */}
      <div className="absolute left-0 inset-y-0 w-[3px] bg-white/20" />
      {/* Top decorative line */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-white/10" />

      {/* Inner content frame */}
      <div className="absolute inset-[6px] border border-white/10 rounded flex flex-col justify-between p-3">
        {/* Category badge */}
        <div className="text-center">
          <span className="inline-block text-[7px] uppercase tracking-[0.25em] text-white/50 font-semibold border border-white/15 px-2 py-0.5 rounded-sm">
            {book.category || "Book"}
          </span>
        </div>

        {/* Decorative center ornament */}
        <div className="flex flex-col items-center gap-1 my-2">
          <div className="w-8 h-[1px] bg-white/20" />
          <div className="w-1 h-1 rounded-full bg-white/30" />
          <div className="w-8 h-[1px] bg-white/20" />
        </div>

        {/* Title */}
        <div className="text-center flex-1 flex items-center justify-center px-1">
          <h3 className="font-serif text-white text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-5 drop-shadow-sm">
            {book.title}
          </h3>
        </div>

        {/* Bottom separator + Author */}
        <div className="text-center mt-auto pt-2">
          <div className="w-12 h-[1px] bg-white/20 mx-auto mb-2" />
          <p className="text-[8px] text-white/60 italic line-clamp-1 font-medium tracking-wide">
            {book.author}
          </p>
        </div>
      </div>
    </div>
  );
};

export const BookCover = ({ book, className = "w-full h-full object-cover" }: BookCoverProps) => {
  const [hasError, setHasError] = useState(false);

  // Check if cover URL is missing
  const hasCover = book.cover && book.cover.trim() !== "";

  if (hasError || !hasCover) {
    return <CssCover book={book} />;
  }

  return (
    <img
      src={book.cover}
      alt={book.title}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};
