import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import {
  BookOpen,
  Brain,
  Film,
  Mic2,
  Users,
  Zap,
  Globe,
  Star,
  Shield,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, useInView } from "framer-motion";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({
  to,
  suffix = "",
  duration = 1800,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-card/40 border border-border/60 rounded-2xl p-6 backdrop-blur-md overflow-hidden group hover:border-border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      <div
        className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none ${accent}`}
      />
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${accent.replace("bg-", "border-").replace("/20", "/30")} bg-opacity-10`}
        style={{ background: "rgba(245,158,11,0.08)" }}
      >
        <Icon className="w-6 h-6 text-amber-400" />
      </div>
      <h3 className="font-serif text-lg font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

// ─── Value Pill ───────────────────────────────────────────────────────────────
function ValuePill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
      <ChevronRight className="w-3 h-3" />
      {text}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const About = () => {
  const stats = [
    { label: "Books Available", value: 28, suffix: "+" },
    { label: "AI Voices Supported", value: 2, suffix: "" },
    { label: "Happy Readers", value: 42, suffix: "+" },
    { label: "Languages", value: 1, suffix: "" },
  ];

  const features = [
    {
      icon: Mic2,
      title: "Voice Cloning (TTS)",
      description:
        "Upload a short voice sample and LITVISION clones it. Your books are then narrated in your own voice — or choose from our built-in premium AI voices.",
      accent: "bg-amber-500/20",
      delay: 0.05,
    },
    {
      icon: Film,
      title: "Book-to-Video Generation",
      description:
        "Transform any chapter into a cinematic video with AI-generated scenes, synchronized narration, and dynamic visual storytelling.",
      accent: "bg-violet-500/20",
      delay: 0.1,
    },
    {
      icon: Brain,
      title: "AI Summarization",
      description:
        "Instantly generate intelligent chapter-by-chapter or full-book summaries powered by large language models to save time and boost retention.",
      accent: "bg-sky-500/20",
      delay: 0.15,
    },
    {
      icon: BookOpen,
      title: "Immersive PDF Reader",
      description:
        "Read securely without downloads. Our in-browser PDF viewer renders every page pixel-perfect with smart layout optimization.",
      accent: "bg-emerald-500/20",
      delay: 0.2,
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your voice samples and library data are encrypted at rest and protected with JWT-based authentication on every endpoint.",
      accent: "bg-rose-500/20",
      delay: 0.25,
    },
    {
      icon: Brain,
      title: "Smart Recommendation System",
      description:
        "LITVISION learns your reading preferences and interests to recommend books you'll love — powered by an intelligent AI recommendation engine.",
      accent: "bg-teal-500/20",
      delay: 0.3,
    },
  ];

  const team = [
    { name: "LITVISION TEAM", role: "AI, Engineering, Design & Cloud" },
  ];

  const values = [
    "Open-access knowledge",
    "Inclusive design",
    "AI-first storytelling",
    "Privacy by default",
    "Continuous innovation",
    "Community-driven growth",
  ];

  return (
    <Layout>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* ── Global background glow ─────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative px-4 md:px-6 max-w-5xl mx-auto py-10 md:py-16 space-y-20">
          {/* ── HERO ──────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Literary Platform
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight">
              The Future of{" "}
              <span style={{ color: "#92400e" }}>
                Reading
              </span>{" "}
              is Here
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              LITVISION merges artificial intelligence with the art of
              storytelling — giving every reader access to immersive narration,
              smart summaries, and cinematic book adaptations.
            </p>

            {/* Stat badges */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-card/50 border border-border/60 rounded-2xl px-5 py-3 text-center backdrop-blur-sm min-w-[110px]"
                >
                  <div className="font-serif text-2xl font-bold text-amber-400">
                    <AnimatedCounter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── MISSION ───────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card/40 border border-border/60 rounded-3xl p-8 md:p-10 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">
                  Our Mission
                </h2>
                <p className="text-muted-foreground text-sm">
                  Making literature accessible, engaging, and intelligent for
                  everyone.
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At LITVISION, we believe that every story deserves to be
              experienced — not just read. Our platform breaks the boundaries
              between text and multimedia, using cutting-edge AI to turn books
              into fully voiced, visually-rich experiences that any reader can
              enjoy, regardless of ability or preference.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Whether you're a student seeking quick AI summaries, an
              audiobook lover who wants their own cloned voice to narrate, or a
              creative who dreams of seeing your favorite chapter as a video —
              LITVISION is built for you.
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((v) => (
                <ValuePill key={v} text={v} />
              ))}
            </div>
          </motion.section>

          {/* ── AI FEATURES ───────────────────────────────────── */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full mb-3">
                <Zap className="w-3.5 h-3.5" />
                Powered by AI
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                What Makes Us Different
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                Six groundbreaking features designed to transform your
                relationship with books — and our Recommendation System finds your next favorite.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </section>

          {/* ── TEAM ──────────────────────────────────────────── */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 rounded-full mb-3">
                <Users className="w-3.5 h-3.5" />
                The Team
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Built by Passionate Engineers
              </h2>
            </motion.div>
            <div className="flex justify-center">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-card/40 border border-amber-500/30 rounded-2xl p-8 text-center backdrop-blur-sm hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 hover:-translate-y-1 max-w-sm w-full"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-9 h-9 text-amber-400" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {member.role}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── FOOTER CTA ────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-amber-500/10 via-card/40 to-violet-500/10 border border-amber-500/20 rounded-3xl p-10 text-center overflow-hidden backdrop-blur-md"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-violet-500/10 rounded-full blur-3xl" />
            </div>
            <BookOpen className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
              Start Your Story Today
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Join thousands of readers already experiencing books in a whole
              new dimension. LITVISION is free to explore.
            </p>
            <a
              href="/library"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              Explore the Library
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default About;
