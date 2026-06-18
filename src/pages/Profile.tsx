import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { profileApi, apiBookToLocal } from "@/lib/api";
import type { Book } from "@/lib/books";
import {
  User,
  Mail,
  BookOpen,
  Heart,
  LogOut,
  ChevronRight,
  Loader2,
  BookMarked,
  MessageSquare,
  Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Profile = () => {
  const { user, logout, updateAvatar } = useAuth();
  const navigate = useNavigate();

  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile details
        const profile = await profileApi.getProfile();
        if (profile.reviewCount !== undefined) {
          setReviewCount(profile.reviewCount);
        }
        if (profile.interests && profile.interests.length > 0) {
          setInterests(profile.interests);
        } else {
          // Fallback to localStorage if API interests are empty
          const stored = localStorage.getItem("livision_interests");
          if (stored) setInterests(JSON.parse(stored));
        }
      } catch (err) {
        console.warn("Could not load user profile details:", err);
        // Fallback to localStorage
        const stored = localStorage.getItem("livision_interests");
        if (stored) setInterests(JSON.parse(stored));
      }

      try {
        // Fetch saved books from API
        const saved = await profileApi.getSavedBooks();
        if (Array.isArray(saved)) {
          setSavedBooks(saved.map(apiBookToLocal));
        }
      } catch (err) {
        console.warn("Could not load saved books:", err);
      }

      setIsLoading(false);
    };

    fetchProfileData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile picture must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateAvatar(base64);
      toast.success("Profile picture updated successfully!");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto animate-fade-in">
        {/* Page title */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-6">
          My Profile
        </h1>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-6"
        >
          {/* Cover banner */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-accent/30 via-primary/20 to-accent/10" />

          <div className="px-6 pb-6">
            {/* Avatar + name row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6">
              <div className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-card shadow-lg shrink-0 overflow-hidden cursor-pointer bg-accent">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-accent-foreground text-3xl sm:text-4xl font-serif font-bold">
                    {avatarLetter}
                  </div>
                )}
                {/* Hover Camera Overlay */}
                <label className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[10px] text-white font-medium">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="sm:mb-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  {user?.name}
                </h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="text-center p-3 sm:p-4 bg-muted rounded-xl">
                <BookMarked className="w-5 h-5 mx-auto mb-1.5 text-accent" />
                {isLoading ? (
                  <div className="h-7 w-8 mx-auto bg-muted-foreground/20 rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {savedBooks.length}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Saved</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted rounded-xl">
                <Heart className="w-5 h-5 mx-auto mb-1.5 text-rose-400" />
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {interests.length}
                </p>
                <p className="text-xs text-muted-foreground">Interests</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted rounded-xl">
                <BookOpen className="w-5 h-5 mx-auto mb-1.5 text-accent" />
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {savedBooks.length > 0 ? Math.ceil(savedBooks.length * 0.6) : 0}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted rounded-xl">
                <MessageSquare className="w-5 h-5 mx-auto mb-1.5 text-blue-400" />
                {isLoading ? (
                  <div className="h-7 w-8 mx-auto bg-muted-foreground/20 rounded animate-pulse mb-1" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {reviewCount}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <User className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-medium text-foreground truncate">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="font-medium text-foreground truncate">{user?.email}</p>
                </div>
              </div>
              {interests.length > 0 && (
                <div className="flex items-start gap-4 p-4 bg-muted rounded-xl">
                  <Heart className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-2">Reading Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20 capitalize"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Saved Books Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-6"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-accent" />
              Saved Books
            </h3>
            <span className="text-sm text-muted-foreground">
              {isLoading ? "..." : savedBooks.length} books
            </span>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-16 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : savedBooks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No saved books yet.</p>
              <p className="text-xs mt-1">Tap the bookmark icon on any book to save it.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {savedBooks.slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-12 h-16 rounded-lg object-cover shadow border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm line-clamp-1">
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {book.author}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {book.category}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
              {savedBooks.length > 5 && (
                <div className="p-4 text-center">
                  <button
                    className="text-sm text-accent hover:underline"
                    onClick={() => navigate("/library")}
                  >
                    View all {savedBooks.length} saved books →
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Settings / Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="p-5 border-b border-border">
            <h3 className="font-serif text-lg font-bold text-foreground">Account</h3>
          </div>
          <div className="divide-y divide-border">
            <button
              onClick={() => navigate("/onboarding")}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left group"
            >
              <Heart className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Reading Interests</p>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your genre preferences</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 hover:bg-rose-500/5 transition-colors text-left group"
            >
              <LogOut className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-rose-500 text-sm">Sign Out</p>
                <p className="text-xs text-muted-foreground mt-0.5">Log out of your account</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
