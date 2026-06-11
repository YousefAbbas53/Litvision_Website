import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import libraryBg from "@/assets/library-bg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast.success("Welcome back to Livision!");
      navigate("/home");
    } else {
      toast.error("Invalid email or password");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={libraryBg}
          alt="Library"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <BookOpen className="w-16 h-16 mb-6" />
          <h1 className="font-serif text-5xl font-bold mb-4">Livision</h1>
          <p className="text-xl opacity-90 max-w-md">
            Discover endless stories, immerse yourself in captivating narratives, and explore new worlds.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <BookOpen className="w-10 h-10 text-accent" />
            <h1 className="font-serif text-3xl font-bold text-foreground">Livision</h1>
          </div>

          <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground mb-8">Sign in to continue your reading journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
<div className="text-right">
  <Link
    to="/forgot-password"
    className="text-sm text-accent hover:underline"
  >
    Forgot password?
  </Link>
</div>



            <Button type="submit" className="w-full" size="xl" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
