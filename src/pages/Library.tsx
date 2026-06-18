import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import type { Book } from "@/lib/books";
import { books as localBooks } from "@/lib/books";
import { profileApi, booksApi, apiBookToLocal } from "@/lib/api";
import { BookMarked, MoreVertical, Trash2, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// Check if an ID is a GUID (user-uploaded book)
const isGuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const Library = () => {
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookToDelete, setBookToDelete] = useState<{ book: Book; deleteFromServer: boolean } | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user's saved books from GET /api/profile/saved-books
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const items = await profileApi.getSavedBooks();
        if (!cancelled) {
          setSavedBooks(items.map(apiBookToLocal));
        }
      } catch (err: any) {
        console.warn("Saved books API failed, using local fallback:", err.message);
        if (!cancelled) {
          setSavedBooks(localBooks.slice(0, 8));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Remove a book: if user-uploaded (GUID), delete from server; otherwise just unsave
  const handleRemoveBook = async (book: Book, deleteFromServer = false) => {
    try {
      if (deleteFromServer && isGuid(book.id)) {
        // Permanently delete the book from the server
        await booksApi.deleteBook(book.id);
        toast.success(`"${book.title}" permanently deleted.`);
      } else {
        // Just unsave (toggle save off)
        await booksApi.saveBook(book.id).catch(() => {
          // Ignore API error — remove from UI anyway
        });
        toast.success(`"${book.title}" removed from your library.`);
      }
    } catch (err: any) {
      toast.error(`Failed to remove: ${err?.message || "Unknown error"}`);
    } finally {
      setSavedBooks((prev) => prev.filter((b) => b.id !== book.id));
      setBookToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-accent" />
            <h1 className="font-serif text-3xl font-bold text-foreground">
              My Library
            </h1>
          </div>

          <div className="flex flex-col items-start sm:items-end">
          <button
              onClick={() => navigate("/new-project")}
              className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full font-medium hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Book
            </button>

          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading your library...</p>
          </div>
        ) : savedBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <BookMarked className="w-16 h-16 text-muted-foreground/30" />
            <h3 className="font-serif text-xl font-semibold text-foreground">
              Your library is empty
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Browse the library and save books to read later. They'll appear here.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {savedBooks.map((book, index) => (
              <div
                key={book.id}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <BookCard book={book} />

                {/* Three-dot menu */}
                <div className="absolute top-2 right-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === book.id ? null : book.id);
                    }}
                    className="p-1 bg-background/80 hover:bg-muted rounded-full shadow"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpen === book.id && (
                    <div className="absolute right-0 mt-2 w-44 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                      {isGuid(book.id) ? (
                        <>
                          <button
                            onClick={() => {
                              setBookToDelete({ book, deleteFromServer: false });
                              setMenuOpen(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted w-full text-left"
                          >
                            <Trash2 size={14} />
                            Remove from Library
                          </button>
                          <button
                            onClick={() => {
                              setBookToDelete({ book, deleteFromServer: true });
                              setMenuOpen(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full text-left"
                          >
                            <Trash2 size={14} />
                            Delete Permanently
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setBookToDelete({ book, deleteFromServer: false });
                            setMenuOpen(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-muted w-full text-left"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Remove Dialog */}
      <AlertDialog
        open={!!bookToDelete}
        onOpenChange={() => setBookToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {bookToDelete?.deleteFromServer
              ? `Permanently delete "${bookToDelete?.book?.title}"? This cannot be undone.`
              : `Remove "${bookToDelete?.book?.title}" from your library?`
            }
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                bookToDelete && handleRemoveBook(bookToDelete.book, bookToDelete.deleteFromServer)
              }
            >
              {bookToDelete?.deleteFromServer ? "Delete Permanently" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Library;
