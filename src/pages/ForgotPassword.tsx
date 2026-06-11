import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // مؤقتًا (بعد كده يتربط Backend)
    setTimeout(() => {
      toast.success("Password reset link sent to your email");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg animate-fade-in">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2 text-center">
          Forgot Password
        </h2>
        <p className="text-muted-foreground mb-6 text-center">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
