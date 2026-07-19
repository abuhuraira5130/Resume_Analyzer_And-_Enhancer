import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    nav({ to: "/dashboard" });
  }

  if (authLoading) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-primary text-primary-foreground">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-background/20 grid place-items-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg">CareerForge AI</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Join thousands<br />landing better roles.</h2>
          <p className="mt-4 text-primary-foreground/85">Free to start. No credit card required.</p>
        </div>
        <div className="text-sm text-primary-foreground/70">© {new Date().getFullYear()} CareerForge AI</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground mt-1">Get started in under a minute.</p>
          </div>
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" required minLength={8} value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create account
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
