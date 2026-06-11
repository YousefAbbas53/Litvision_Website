import { useState } from "react";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import { books } from "@/lib/books";
import { BookMarked, MoreVertical, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const Library = () => {
  const [savedBooks, setSavedBooks] = useState(books.slice(0, 8));
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const navigate = useNavigate();

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
               className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full font-medium hover:bg-accent/90 transition-all duration-300 shadow-[0_0_15px_rgba(var(--accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--accent),0.5)] flex items-center gap-2"
             >
               <Upload className="w-5 h-5" />
               Upload Book
             </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {savedBooks.map((book, index) => (
            <div
              key={book.id}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <BookCard book={book} />

              {/* زر التلات نقط */}
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
                  <div className="absolute right-0 mt-2 w-32 bg-background border rounded shadow-md">
                    <button
                      onClick={() => {
                        setBookToDelete(book);
                        setMenuOpen(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-muted w-full"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog تأكيد الحذف */}
      <AlertDialog
        open={!!bookToDelete}
        onOpenChange={() => setBookToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            Are you sure you want to delete this book?
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setSavedBooks((prev) =>
                  prev.filter((b) => b.id !== bookToDelete.id)
                );
                setBookToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Library;
