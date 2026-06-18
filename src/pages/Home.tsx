import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import CategoryCard from "@/components/CategoryCard";
import { categories, books as localBooks } from "@/lib/books";
import type { Book } from "@/lib/books";
import { booksApi, recommendationsApi, apiBookToLocal, extractBooks, getToken } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Search, Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import libraryBg from "@/assets/library-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useSound } from "@/components/audio/SoundManager";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const Home = () => {
  const navigate = useNavigate();
  const { playFlip } = useSound();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // API state
  const [books, setBooks] = useState<Book[]>([]);
  const [categoryBooks, setCategoryBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("livision_interests");
    if (saved) {
      try {
        setUserInterests(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!getToken()) return;
      setIsRecsLoading(true);
      try {
        const res = await recommendationsApi.getRecommendations();
        if (res && res.books) {
          setRecommendations(res.books.map(apiBookToLocal));
        }
      } catch (err) {
        console.warn("Failed to fetch recommendations from API:", err);
      } finally {
        setIsRecsLoading(false);
      }
    };
    
    if (books.length > 0) {
      fetchRecommendations();
    }
  }, [books]);

  // Fetch books from API
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await booksApi.getBooks({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: searchQuery || undefined,
        page: 1,
        pageSize: 50,
      });

      const rawBooks = extractBooks(result);
      const mapped = rawBooks.map(apiBookToLocal);
      setBooks(mapped);
      
      // Keep a reference of full books for category cards so their cover images don't disappear
      if (categoryBooks.length === 0 && selectedCategory === "all" && !searchQuery) {
        setCategoryBooks(mapped);
      }
    } catch (err: any) {
      console.error("Failed to load books:", err);
      setError(err.message || "Failed to load books. Showing cached data.");
      // Fallback to local books if API fails
      setBooks(localBooks);
      if (categoryBooks.length === 0) {
        setCategoryBooks(localBooks);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, categoryBooks.length]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchBooks]);

  const filteredBooks = books;

  const recommendedBooks =
    recommendations.length > 0
      ? recommendations.slice(0, 5)
      : userInterests.length > 0
      ? books
          .filter((b) =>
            userInterests.includes(b.category.toLowerCase())
          )
          .slice(0, 5)
      : books.slice(0, 5);

  const topRatedBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <Layout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-secondary/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search book name, author, edition..."
              className="pl-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative" ref={notifRef}>
            <ThemeToggle className="p-2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative interactive" />

            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 bg-background border border-border shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm font-semibold text-foreground mb-3 px-1">
                  Notifications
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-accent shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">New book added</p>
                      <p className="text-xs text-muted-foreground mt-0.5">A new book was added to the library</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-accent shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">New recommendation</p>
                      <p className="text-xs text-muted-foreground mt-0.5">We found books based on your interests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors opacity-60">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Welcome to LITVISION!</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Start exploring your reading journey</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 cursor-pointer hover:bg-muted px-2 py-1 rounded-lg transition animate-fade-in"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="hidden sm:block font-medium text-foreground">
                {user?.name || "User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden mb-12 h-auto md:h-80 group cursor-pointer">
          <img
            src={libraryBg}
            alt="Library"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent dark:from-background/95 dark:via-background/80" />

          <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
            <div className="flex-1 max-w-xl">
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground dark:text-foreground mb-4 animate-slide-up">
                Welcome back, {user?.name?.split(" ")[0] || "Reader"}!
              </h1>
              <p
                className="text-primary-foreground/90 dark:text-muted-foreground text-lg animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                Discover your next great read from our collection of captivating
                stories.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Categories
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-hide px-2">
            {categories.map((cat) => {
              const sourceBooks = categoryBooks.length > 0 ? categoryBooks : books;
              const catBooks =
                cat.id === "all"
                  ? sourceBooks.slice(0, 3)
                  : sourceBooks
                      .filter(
                        (b) =>
                          b.category.toLowerCase() === cat.id.toLowerCase()
                      )
                      .slice(0, 3);
              return (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  books={catBooks}
                  isSelected={selectedCategory === cat.id}
                  onClick={() => {
                    playFlip();
                    setSelectedCategory(cat.id);
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* API Error Banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Books Grid */}
        <section className="mb-14 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {selectedCategory === "all"
                ? "Browse Library"
                : `${categories.find((c) => c.id === selectedCategory)?.name} Books`}
            </h2>
            {isLoading && (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-background/5 blur-3xl rounded-3xl -z-10 pointer-events-none" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory + searchQuery}
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, staggerChildren: 0.1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {filteredBooks.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No books found matching your search.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recommended For You */}
        {!searchQuery && !isLoading && recommendedBooks.length > 0 && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
              Recommended For You
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recommendedBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Top Rated */}
        {!searchQuery && !isLoading && topRatedBooks.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
              Top Rated Books
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {topRatedBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Home;
