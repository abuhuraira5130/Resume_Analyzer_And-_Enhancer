import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import {
  LayoutDashboard, FileUp, FileSearch, KanbanSquare, User,
  Sparkles, LogOut, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resumes", label: "Resumes", icon: FileUp },
  { to: "/interview", label: "Interview", icon: Brain },
  { to: "/tracker", label: "Job Tracker", icon: KanbanSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar">
        <Link to="/dashboard" className="flex items-center gap-2 p-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold leading-tight">CareerForge</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI</div>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => {
            const active = loc.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                )}>
                <n.icon className="w-4 h-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="text-sm font-medium truncate">{user.email}</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2"
            onClick={async () => { await signOut(); nav({ to: "/" }); }}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile bar */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 glass rounded-2xl p-2 flex justify-around">
        {NAV.map(n => {
          const active = loc.pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={cn(
              "p-2 rounded-lg",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}><n.icon className="w-5 h-5" /></Link>
          );
        })}
      </div>

      {/* Main */}
      <main key={loc.pathname} className="flex-1 min-w-0 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
