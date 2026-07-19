import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  }

  if (authLoading) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-background/20 grid place-items-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg">CareerForge AI</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight">Your AI career coach.<br />Working 24/7.</h2>
          <p className="mt-4 text-primary-foreground/85">Resume builder, job tracker, and interview prep — all in one place.</p>
        </div>
        <div className="text-sm text-primary-foreground/70">© {new Date().getFullYear()} CareerForge AI</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to continue your career journey.</p>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" required value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-glow">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Sign in
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
