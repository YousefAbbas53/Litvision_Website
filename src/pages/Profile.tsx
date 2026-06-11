import Layout from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { User, Mail, BookOpen, Star } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">My Profile</h1>

        <div className="bg-card rounded-2xl border border-border p-8 mb-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-4xl font-serif font-bold mb-4">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-muted rounded-xl">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">Books Read</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-xl">
              <Star className="w-6 h-6 mx-auto mb-2 text-amber" />
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-xl">
              <User className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">7</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
