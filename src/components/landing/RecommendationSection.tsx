import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";

const books = [
  { id: 1, title: "Project Hail Mary", author: "Andy Weir", rating: 4.9, cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80", reason: "An incredible deep dive into lone space survival with mind-bending science." },
  { id: 2, title: "Dune", author: "Frank Herbert", rating: 4.9, cover: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80", reason: "A sci-fi classic with deep lore." },
  { id: 3, title: "Foundation", author: "Isaac Asimov", rating: 4.7, cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80", reason: "Based on your interest in space empires." },
];

const InteractiveCard = ({ book, delay }: { book: any; delay: number }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    // Max rotation 15 degrees
    setRotateX(((y - centerY) / centerY) * -15);
    setRotateY(((x - centerX) / centerX) * 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: delay, duration: 0.8, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? 1.05 : 1,
        y: isHovered ? -15 : 0
      }}
      className="relative group interactive cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="bg-card rounded-2xl border border-border shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden aspect-[3/4] relative">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80';
          }}
        />

        {/* Detail reveal background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-12 group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
          <h3 className="font-serif font-bold text-2xl text-white mb-1 drop-shadow-xl">{book.title}</h3>
          <p className="text-white/80 mb-3 font-medium">{book.author}</p>

          <div className="flex items-center gap-1 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pb-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="text-white font-medium">{book.rating}</span>
          </div>

          <p className="text-sm text-white/90 italic opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200 border-t border-white/20 pt-3 leading-relaxed">
            "{book.reason}"
          </p>
        </div>
      </div>

      {/* 3D dynamic shadow matching tilt */}
      <div
        className="absolute -bottom-6 left-4 right-4 h-6 bg-primary/40 blur-2xl transition-all duration-300 scale-90"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: `translateX(${-rotateY}px) translateY(${rotateX}px)`
        }}
      />
    </motion.div>
  );
};

const RecommendationSection = () => {
  return (
    <section className="py-24 relative bg-secondary/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif font-bold mb-4"
          >
            AI-Powered <span className="text-primary glow-text">Recommendations</span>
          </motion.h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover your next obsession. Our recommendation engine understands your taste beyond simple genres.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 perspective-1000">
          {books.map((book, idx) => (
            <InteractiveCard key={book.id} book={book} delay={idx * 0.2} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;
