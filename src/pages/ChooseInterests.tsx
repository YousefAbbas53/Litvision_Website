import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/books";
import { BookOpen, Compass, Heart, Search, Rocket, Sparkles, Brain } from "lucide-react";
import libraryBg from "@/assets/library-bg.jpg";

const iconMap: Record<string, any> = {
  adventure: Compass,
  romance: Heart,
  mystery: Search,
  "sci-fi": Rocket,
  fantasy: Sparkles,
  "self-help": Brain,
};

const ChooseInterests = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  const selectableCategories = categories.filter((c) => c.id !== "all");

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      localStorage.setItem("livision_interests", JSON.stringify(selected));
    }
    navigate("/home");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={libraryBg}
          alt="Library Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide py-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <BookOpen className="w-16 h-16 text-accent" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            What kind of books do you love?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Select your favorite genres to help us personalize your library.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12"
        >
          {selectableCategories.map((cat, index) => {
            const isSelected = selected.includes(cat.id);
            const Icon = iconMap[cat.id] || BookOpen;

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCategory(cat.id)}
                className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.3)]"
                    : "border-border bg-card/50 hover:bg-card hover:border-accent/50"
                }`}
              >
                <Icon
                  className={`w-12 h-12 mb-4 transition-colors ${
                    isSelected ? "text-accent" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`font-medium text-lg transition-colors ${
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-center"
        >
          <Button
            size="xl"
            onClick={handleContinue}
            className="w-full md:w-auto px-12 py-6 text-lg"
          >
            {selected.length > 0 ? "Continue" : "Skip for now"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ChooseInterests;
