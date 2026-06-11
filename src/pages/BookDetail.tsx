import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // تأكد من تثبيت framer-motion
import Layout from "@/components/Layout";
import { getBookById } from "@/lib/books";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Star,
  Bookmark,
  Share2,
  Download,
  ChevronUp,
  ChevronDown,
  X,
  Headphones,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/components/audio/SoundManager";
import { VoiceSelectionModal } from "@/components/audio/VoiceSelectionModal";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const book = getBookById(id || "");
  const { playCinematic, playHover } = useSound();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  if (!book) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Book Not Found
            </h2>
            <Button onClick={() => navigate("/home")}>Go Back Home</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleBookmark = () => {
    toast.success("Book added to your library!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Layout>
      <div className="p-6 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Book Cover */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-4 hidden lg:flex">
                <button className="p-3 rounded-full bg-card border border-border hover:bg-muted transition-colors">
                  <ChevronUp className="w-5 h-5 text-foreground" />
                </button>
                <button className="p-3 rounded-full bg-card border border-border hover:bg-muted transition-colors">
                  <ChevronDown className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <div className="w-72 md:w-80 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Book Actions (Save, Share, Download) */}
              <div className="flex justify-center items-center gap-6 mt-6 animate-fade-in">
                <button
                  onClick={handleBookmark}
                  className="p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all group"
                  title="Save to Library"
                >
                  <Bookmark className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all group"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button 
                  className="p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all group"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Right - Book Info */}
          <div className="animate-slide-up">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {book.title}
            </h1>
            <p className="text-xl font-medium text-foreground mb-4">
              {book.author}
            </p>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-10 w-full">
              <Button
                size="xl"
                variant="accent"
                className="gap-2 w-full justify-center"
                onClick={() => navigate(`/video/${book.id}`)}
              >
                Book to Video
                <span className="text-lg">↗</span>
              </Button>

              <Button
                size="xl"
                variant="outline"
                onClick={() => { playHover(); setIsVoiceModalOpen(true); }}
                className="gap-2 w-full justify-center group relative hover:border-primary/50 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(255,150,50,0.15)]"
              >
                Listen
                <Headphones className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
              </Button>

              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate(`/summary/${book.id}`)}
                className="gap-2 w-full justify-center"
              >
                Summary
                <Star className="w-4 h-4 text-primary opacity-80" />
              </Button>

              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate(`/read/${book.id}`)}
                className="gap-2 w-full justify-center group relative hover:border-primary/50 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(255,150,50,0.15)]"
              >
                Reading Book
                <BookOpen className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            {/* Description Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">Language</h4>
                  <p className="text-muted-foreground">{book.language}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Pages</h4>
                  <p className="text-muted-foreground">{book.pages} pages</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">ISBN</h4>
                  <p className="text-muted-foreground">{book.isbn}</p>
                </div>
              </div>
            </div>

            {/* Reader Reviews Section - تم إكماله هنا */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Reader Reviews
              </h3>
              <div className="space-y-4">
                {book.reviews && book.reviews.length > 0 ? (
                  book.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={review.avatar}
                        alt={review.userName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-muted"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">
                            {review.userName}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-muted text-muted"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm italic leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isVoiceModalOpen && (
            <VoiceSelectionModal
              isOpen={isVoiceModalOpen}
              onClose={() => setIsVoiceModalOpen(false)}
              bookId={book.id}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default BookDetail;