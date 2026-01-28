import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Login successful!");
        navigate("/colorpro");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/colorpro`
        }
      });

      if (error) throw error;

      toast.success("Magic link sent! Check your email.");
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            <h1 className="text-2xl font-bold text-foreground mb-6">Sign In</h1>
            
            {/* Toggle between password and magic link */}
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={!useMagicLink ? "default" : "outline"}
                size="sm"
                onClick={() => setUseMagicLink(false)}
                className="flex-1"
              >
                Password
              </Button>
              <Button
                type="button"
                variant={useMagicLink ? "default" : "outline"}
                size="sm"
                onClick={() => setUseMagicLink(true)}
                className="flex-1"
              >
                Magic Link
              </Button>
            </div>
            
            {useMagicLink ? (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="Enter your email"
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  We'll send you a secure link to sign in instantly. No password needed.
                </p>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            <div className="mt-6 space-y-2 text-center text-sm">
              <Link
                to="/reset-password-request"
                className="text-primary hover:underline block"
              >
                Forgot password?
              </Link>
              <div className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
