import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { FileUp, KanbanSquare, FileSearch, TrendingUp, Target, Briefcase, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

type Stats = {
  totalResumes: number;
  totalApps: number;
  interviews: number;
  offers: number;
};

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [resumes, jobs, profile] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("job_applications").select("status").eq("user_id", user.id),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ]);
      const apps = jobs.data ?? [];
      setStats({
        totalResumes: resumes.count ?? 0,
        totalApps: apps.length,
        interviews: apps.filter(a => ["interview", "technical", "final_round"].includes(a.status)).length,
        offers: apps.filter(a => ["offer", "accepted"].includes(a.status)).length,
      });
      setName(profile.data?.full_name ?? "");
    })();
  }, [user]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">Welcome back{name ? `, ${name.split(" ")[0]}` : ""} 👋</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-primary shadow-glow hover-glow press"><Link to="/resumes"><FileUp className="w-4 h-4 mr-2" /> Upload resume</Link></Button>
          <Button asChild variant="outline" className="hover-lift press"><Link to="/tracker"><KanbanSquare className="w-4 h-4 mr-2" /> Add job</Link></Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={FileSearch} label="Resumes" value={stats?.totalResumes ?? 0} accent="primary" delay={0} />
        <StatCard icon={Briefcase} label="Applications" value={stats?.totalApps ?? 0} accent="warning" delay={80} />
        <StatCard icon={Target} label="Interviews" value={stats?.interviews ?? 0} accent="primary" delay={160} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 animate-slide-in-left delay-150">
          <h3 className="font-semibold mb-1">Get started</h3>
          <p className="text-sm text-muted-foreground mb-5">Two steps to track your career progress.</p>
          <div className="space-y-3">
            <StepRow n={1} title="Upload your resume" desc="PDF or DOCX, up to 10MB." cta="Upload" to="/resumes" />
            <StepRow n={2} title="Track applications" desc="Drag-and-drop kanban from wishlist to offer." cta="Open tracker" to="/tracker" />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-primary animate-gradient p-6 text-primary-foreground shadow-glow animate-slide-in-right delay-300">
          <Sparkles className="w-6 h-6 mb-3 animate-float" />
          <h3 className="font-semibold text-lg">Application Tracking</h3>
          <p className="text-sm text-primary-foreground/85 mt-1">Keep track of your resume updates, job applications, interview pipelines, and offers in one unified tracker.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <Mini label="Applications" value={`${stats?.totalApps ?? 0}`} />
            <Mini label="Interviews" value={`${stats?.interviews ?? 0}`} />
            <Mini label="Offers" value={`${stats?.offers ?? 0}`} />
            <Mini label="Pipeline" value={`${(stats?.totalApps ?? 0) - (stats?.offers ?? 0)}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, suffix, delay = 0 }: any) {
  const map: Record<string, string> = { primary: "text-primary bg-primary/10", success: "text-success bg-success/10", warning: "text-warning bg-warning/10" };
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="group rounded-2xl border border-border bg-card p-5 hover-lift animate-fade-up"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${map[accent]} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-3xl font-bold">{value}{suffix}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function StepRow({ n, title, desc, cta, to }: any) {
  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold grid place-items-center transition-transform duration-300 group-hover:scale-110">{n}</div>
      <div className="flex-1">
        <div className="font-medium group-hover:text-primary transition-colors">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
      <Button asChild variant="outline" size="sm" className="press"><Link to={to}>{cta}</Link></Button>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/15 backdrop-blur p-3">
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}
