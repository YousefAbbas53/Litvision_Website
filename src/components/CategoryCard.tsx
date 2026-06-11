import { motion } from "framer-motion";
import { Book } from "@/lib/books";
import { BookOpen } from "lucide-react";

interface CategoryCardProps {
  category: { id: string; name: string };
  books: Book[];
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard = ({ category, books, isSelected, onClick }: CategoryCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover="hover"
      className={`relative flex flex-col items-center justify-end p-4 rounded-xl border cursor-pointer transition-all duration-300 min-w-[170px] h-64 shrink-0 group ${
        isSelected
          ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(var(--accent),0.15)]"
          : "border-border bg-card/40 hover:bg-card hover:border-accent/40"
      }`}
    >
      <div className="absolute top-6 left-0 w-full h-40 flex justify-center items-end perspective-[1000px] mb-4">
        {books.slice(0, 3).map((book, idx) => {
          const isCenter = idx === 0;
          const isLeft = idx === 1;
          const isRight = idx === 2;

          return (
            <motion.div
              key={book.id}
              variants={{
                hover: {
                  y: isCenter ? -15 : isLeft ? -5 : -5,
                  x: isCenter ? 0 : isLeft ? -40 : 40,
                  rotateZ: isCenter ? 0 : isLeft ? -15 : 15,
                  scale: isCenter ? 1.05 : 0.95,
                  zIndex: isCenter ? 30 : 20,
                  transition: { duration: 0.4, ease: "easeOut" }
                }
              }}
              className="absolute bottom-0 w-24 h-36 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden transition-all duration-500 ease-out"
              style={{
                zIndex: isCenter ? 30 : 20 - idx,
                transform: `
                  translateX(${isCenter ? 0 : isLeft ? -20 : 20}px)
                  translateY(${isCenter ? 0 : 5}px)
                  rotateZ(${isCenter ? 0 : isLeft ? -8 : 8}deg)
                  scale(${isCenter ? 1 : 0.9})
                `,
              }}
            >
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          );
        })}

        {books.length === 0 && (
          <div className="w-24 h-36 rounded-md shadow-lg border border-white/10 bg-muted flex flex-col items-center justify-center opacity-50">
             <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
          </div>
        )}
      </div>

      <div className="relative z-40 mt-auto pt-4 text-center w-full">
        <span
          className={`block font-medium text-base transition-colors ${
            isSelected ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
          }`}
        >
          {category.name}
        </span>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
