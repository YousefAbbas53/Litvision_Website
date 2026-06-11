import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import CategoryCard from "@/components/CategoryCard";
import { books, categories, getBooksByCategory } from "@/lib/books";
import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
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
  const { user } = useAuth();
  const [userInterests, setUserInterests] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("livision_interests");
    if (saved) {
      try {
        setUserInterests(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const filteredBooks = getBooksByCategory(selectedCategory).filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recommendedBooks = userInterests.length > 0 
    ? books.filter(b => userInterests.includes(b.category.toLowerCase())).slice(0, 5)
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

          <div className="flex items-center gap-2 sm:gap-4 relative">
            <ThemeToggle className="p-2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors relative interactive" />

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>

            {showNotifications && (
              <div className="absolute right-16 top-12 w-64 bg-background border border-border shadow-lg rounded-lg p-3 z-50">
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  Notifications
                </p>
                <div className="space-y-2 text-sm">
                  <div className="p-2 rounded-md hover:bg-muted cursor-pointer">
                    New book added to the library
                  </div>
                  <div className="p-2 rounded-md hover:bg-muted cursor-pointer">
                    You have a new recommendation
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 cursor-pointer hover:bg-muted px-2 py-1 rounded-lg transition"
            >
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
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

        {/* Categories (Visual Edition) */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Categories
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-hide px-2">
            {categories.map((cat) => {
              const catBooks = cat.id === "all" 
                ? books.slice(0, 3) 
                : books.filter(b => b.category.toLowerCase() === cat.id.toLowerCase()).slice(0, 3);
              return (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  books={catBooks}
                  isSelected={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                />
              );
            })}
          </div>
        </section>

        {/* Selected Category Books (Filtered) with Blur effect */}
        <section className="mb-14 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {selectedCategory === "all"
                ? "Browse Library"
                : `${categories.find((c) => c.id === selectedCategory)?.name} Books`}
            </h2>
          </div>

          <div className="relative">
            {/* Very slight ambient background blur behind the grid for visual focus */}
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

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No books found matching your search.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recommended For You Section */}
        {!searchQuery && (
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

        {/* Top Rated Books */}
        {!searchQuery && (
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
