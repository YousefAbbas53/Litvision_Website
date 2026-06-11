import { useState } from "react";
import Layout from "@/components/Layout";
import BookCard from "@/components/BookCard";
import { books, categories, getBooksByCategory } from "@/lib/books";
import { BookOpen, Compass, Heart, Search, Rocket, Sparkles, Brain } from "lucide-react";

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
  const filteredBooks = getBooksByCategory(selectedCategory);

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
                  {getBooksByCategory(cat.id).length} books
                </p>
              </button>
            );
          })}
        </div>

        {/* Books Grid */}
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
          {selectedCategory === "all" ? "All Books" : categories.find((c) => c.id === selectedCategory)?.name}
        </h2>
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
      </div>
    </Layout>
  );
};

export default Category;
