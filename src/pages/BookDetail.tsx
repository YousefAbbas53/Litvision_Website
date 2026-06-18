import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { getBookById } from "@/lib/books";
import type { Book } from "@/lib/books";
import { booksApi, profileApi, apiBookToLocal, getToken, BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Star,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  ChevronUp,
  ChevronDown,
  Headphones,
  BookOpen,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/components/audio/SoundManager";
import { VoiceSelectionModal } from "@/components/audio/VoiceSelectionModal";
import { BookCover } from "@/components/BookCover";
import { useAuth } from "@/lib/auth";

const isGuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playCinematic, playHover } = useSound();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Book state — try API first, fallback to local
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  // Review states
  const [userRating, setUserRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Review editing states
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  const handleUpdateReview = async (reviewId: string) => {
    if (!book) return;
    if (!editComment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }
    setIsUpdatingReview(true);
    try {
      await booksApi.editReview(book.id, reviewId, {
        comment: editComment.trim(),
        rating: editRating,
      });

      // Update local state
      setBook((prev) => {
        if (!prev) return null;
        const updatedReviews = (prev.reviews || []).map((r) => {
          if (r.id === reviewId) {
            return { ...r, comment: editComment.trim(), rating: editRating };
          }
          return r;
        });

        // Recalculate average rating
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAverage = totalRating / updatedReviews.length;

        return {
          ...prev,
          reviews: updatedReviews,
          rating: Number(newAverage.toFixed(1)),
        };
      });

      toast.success("Review updated successfully!");
      setEditingReviewId(null);
    } catch (err: any) {
      console.error("Failed to update review:", err);
      toast.error(err.message || "Failed to update review.");
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!book) return;
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await booksApi.deleteReview(book.id, reviewId);

      // Update local state
      setBook((prev) => {
        if (!prev) return null;
        const updatedReviews = (prev.reviews || []).filter((r) => r.id !== reviewId);

        // Recalculate average rating
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAverage = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

        return {
          ...prev,
          reviews: updatedReviews,
          rating: Number(newAverage.toFixed(1)),
        };
      });

      toast.success("Review deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      toast.error(err.message || "Failed to delete review.");
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiBook = await booksApi.getBook(id);
        if (!cancelled) setBook(apiBookToLocal(apiBook));
        
        // Check if book is saved/bookmarked
        if (getToken()) {
          const savedBooks = await profileApi.getSavedBooks();
          if (!cancelled && savedBooks.some((b) => b.id === id)) {
            setIsSaved(true);
          }
        }
      } catch (err: any) {
        console.warn("API fetch failed, using local data:", err.message);
        // fallback to local static data
        const local = getBookById(id);
        if (!cancelled) {
          if (local) {
            setBook(local);
          } else {
            setError("Book not found.");
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleBookmark = async () => {
    if (!book) return;
    setIsSaving(true);
    try {
      // API toggles save/unsave internally
      const res = await booksApi.saveBook(book.id);
      setIsSaved(res.saved);
      toast.success(res.message || (res.saved ? "Book saved to your library!" : "Removed from library"));
    } catch (err: any) {
      console.error("Failed to bookmark book:", err);
      // fallback
      setIsSaved((prev) => !prev);
      toast.success(!isSaved ? "Book saved to your library!" : "Removed from library");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = async () => {
    if (!book) return;
    const downloadToast = toast.loading("Preparing download...");
    try {
      const response = await fetch(`${BASE_URL}/books/${book.id}/download-pdf`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (!response.ok) {
        throw new Error("Unable to download book PDF content. Make sure you are logged in.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: downloadToast });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to download PDF.", { id: downloadToast });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    if (!getToken()) {
      toast.error("Please login to write a review.");
      navigate("/login");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter your review comment.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = await booksApi.addReview(book.id, {
        comment: comment.trim(),
        rating: userRating,
      });

      // Update local reviews state instantly
      setBook((prevBook) => {
        if (!prevBook) return null;
        const updatedReviews = [
          ...(prevBook.reviews || []),
          {
            id: newReview.id,
            userId: newReview.userId || user?.id,
            userName: newReview.userName || user?.name || "You",
            avatar: user?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            comment: newReview.comment,
            rating: newReview.rating,
          },
        ];

        // Recalculate average rating
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAverage = totalRating / updatedReviews.length;

        return {
          ...prevBook,
          reviews: updatedReviews,
          rating: Number(newAverage.toFixed(1)),
        };
      });

      toast.success("Review submitted successfully!");
      setComment("");
      setUserRating(5);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      toast.error(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!book || error) {
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
                <BookCover book={book} className="w-full h-full object-cover" />
              </div>

              {/* Book Actions */}
              <div className="flex justify-center items-center gap-6 mt-6 animate-fade-in">
                <button
                  onClick={handleBookmark}
                  disabled={isSaving}
                  className="p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all group"
                  title={isSaved ? "Remove from Library" : "Save to Library"}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="w-5 h-5 text-primary" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all group"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button
                  onClick={handleDownload}
                  className="p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all group"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                {isGuid(book.id) && (
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to permanently delete "${book.title}" from the server? This cannot be undone.`)) {
                        try {
                          await booksApi.deleteBook(book.id);
                          toast.success(`"${book.title}" has been deleted.`);
                          navigate("/library");
                        } catch (err: any) {
                          toast.error(`Failed to delete: ${err?.message || "Unknown error"}`);
                        }
                      }
                    }}
                    className="p-3 rounded-full bg-card border border-border shadow-sm hover:shadow-md hover:border-red-500/30 hover:-translate-y-1 transition-all group"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </button>
                )}
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

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(book.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
              <span className="text-muted-foreground text-sm ml-1">
                {book.rating.toFixed(1)}
              </span>
            </div>

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
                onClick={() => {
                  playHover();
                  const savedState = localStorage.getItem(`tts_state_${book.id}`);
                  if (savedState) {
                    try {
                      const parsed = JSON.parse(savedState);
                      if (parsed.status === "generating" || parsed.status === "available") {
                        navigate(`/tts/${book.id}`);
                        return;
                      }
                    } catch (e) {
                      console.error("Failed to parse saved tts state:", e);
                    }
                  }
                  setIsVoiceModalOpen(true);
                }}
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

            {/* Description + Details */}
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
                  <h4 className="font-semibold text-foreground">Category</h4>
                  <p className="text-muted-foreground">{book.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">ISBN</h4>
                  <p className="text-muted-foreground">{book.isbn}</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Reader Reviews
              </h3>
              <div className="space-y-4">
                {book.reviews && book.reviews.length > 0 ? (
                  book.reviews.map((review) => {
                    const isOwnReview = user && (review.userId === user.id || review.userName === user.name);
                    const reviewAvatar = isOwnReview && user?.avatarUrl ? user.avatarUrl : review.avatar;

                    return (
                      <div
                        key={review.id}
                        className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                      >
                        <img
                          src={reviewAvatar}
                          alt={review.userName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-muted shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          {editingReviewId === review.id ? (
                            <div className="space-y-3">
                              {/* Edit Rating */}
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  const starVal = i + 1;
                                  return (
                                    <button
                                      type="button"
                                      key={i}
                                      onClick={() => setEditRating(starVal)}
                                      className="p-0.5 hover:scale-110 transition-transform"
                                    >
                                      <Star
                                        className="w-5 h-5 transition-all"
                                        style={{
                                          fill: starVal <= editRating ? "#fbbf24" : "transparent",
                                          color: starVal <= editRating ? "#fbbf24" : "rgba(156, 163, 175, 0.3)"
                                        }}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                              {/* Edit Comment */}
                              <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                                rows={3}
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="accent"
                                  onClick={() => handleUpdateReview(review.id)}
                                  disabled={isUpdatingReview}
                                >
                                  {isUpdatingReview ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingReviewId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-foreground truncate mr-2">
                                  {review.userName}
                                </span>
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${
                                          i < review.rating
                                            ? "fill-amber-400 text-amber-400"
                                            : "fill-muted text-muted"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {isOwnReview && (
                                    <div className="flex items-center gap-2 ml-2">
                                      <button
                                        onClick={() => {
                                          setEditingReviewId(review.id);
                                          setEditComment(review.comment);
                                          setEditRating(review.rating);
                                        }}
                                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        title="Edit Review"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        title="Delete Review"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground text-sm italic leading-relaxed break-words">
                                "{review.comment}"
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground italic">No reviews yet.</p>
                )}
              </div>
            </div>

            {/* Write a Review Form */}
            <div className="mt-10 border-t border-border pt-8">
              <form onSubmit={handleSubmitReview} className="p-6 bg-muted/30 border border-border rounded-2xl shadow-sm space-y-5">
                <div>
                  <h4 className="font-serif text-lg font-semibold text-foreground">Write a Review</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Share your reading experience with the community</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground block">Your Rating</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      const isHighlighted = hoveredRating ? starValue <= hoveredRating : starValue <= userRating;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setUserRating(starValue)}
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 hover:scale-110 active:scale-95 transition-transform"
                          aria-label={`Rate ${starValue} out of 5 stars`}
                        >
                          <Star
                            className="w-7 h-7 transition-all drop-shadow-sm"
                            style={{
                              fill: isHighlighted ? "#fbbf24" : "transparent",
                              color: isHighlighted ? "#fbbf24" : "rgba(156, 163, 175, 0.3)"
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-comment" className="text-sm font-medium text-muted-foreground block">
                    Comment
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike about this book? Write your thoughts here..."
                    rows={4}
                    className="w-full p-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none text-sm leading-relaxed"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full sm:w-auto px-6 gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
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