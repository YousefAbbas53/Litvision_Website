import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import { categories } from "@/lib/books";
import { BookOpen, Compass, Heart, Search, Rocket, Sparkles, Brain, Loader2 } from "lucide-react";
import { booksApi, apiBookToLocal, extractBooks } from "@/lib/api";
import type { Book } from "@/lib/books";

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen,
  Compass,
  Heart,
  Search,
  Rocket,
  Sparkles,
  Brain,
};

const Category = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all books (up to 200) so we can display accurate category counts
        const res = await booksApi.getBooks({ pageSize: 200 });
        const extracted = extractBooks(res);
        const mapped = extracted.map(apiBookToLocal);
        setBooksList(mapped);
      } catch (err: any) {
        console.error("Failed to load books:", err);
        setError(err.message || "Something went wrong while loading books.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllBooks();
  }, []);

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return booksList.length;
    return booksList.filter(
      (b) => b.category.toLowerCase() === categoryId.toLowerCase()
    ).length;
  };

  const filteredBooks = selectedCategory === "all"
    ? booksList
    : booksList.filter(
        (b) => b.category.toLowerCase() === selectedCategory.toLowerCase()
      );

  return (
    <Layout>
      <div className="p-6">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Browse Categories</h1>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || BookOpen;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-6 rounded-xl border transition-all duration-200 text-left hover-lift ${
                  selectedCategory === cat.id
                    ? "bg-accent text-accent-foreground border-accent shadow-lg"
                    : "bg-card text-card-foreground border-border hover:border-accent/50"
                }`}
              >
                <IconComponent className="w-8 h-8 mb-3" />
                <h3 className="font-semibold">{cat.name}</h3>
                <p className="text-sm opacity-70">
                  {loading ? "..." : `${getCategoryCount(cat.id)} books`}
                </p>
              </button>
            );
          })}
        </div>

        {/* Books Grid Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {selectedCategory === "all" ? "All Books" : categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          {!loading && (
            <span className="text-sm text-muted-foreground">
              Showing {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
            <p className="text-sm">Loading books from server...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border p-6">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border p-6">
            <p className="text-muted-foreground">No books found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book, index) => (
              <div
                key={book.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Category;
