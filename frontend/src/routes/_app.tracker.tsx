import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  ExternalLink,
  Trash2,
  Star,
  DollarSign,
  Briefcase,
} from "lucide-react";

export const Route = createFileRoute("/_app/tracker")({ component: TrackerPage });

type Job = {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_url: string | null;
  location: string | null;
  job_type: string | null;
  status: string;
  applied_date: string | null;
  deadline: string | null;
  notes: string | null;
  salary_offered: number | null;
  offer_amount: number | null;
  excitement_level: number | null;
  position: number | null;
  created_at: string;
};

const COLUMNS: { id: string; label: string; tone: string }[] = [
  { id: "wishlist", label: "Wishlist", tone: "bg-muted text-muted-foreground" },
  { id: "applied", label: "Applied", tone: "bg-primary/10 text-primary" },
  { id: "interview", label: "Interview", tone: "bg-warning/10 text-warning" },
  { id: "technical", label: "Technical", tone: "bg-warning/10 text-warning" },
  { id: "final_round", label: "Final Round", tone: "bg-accent/15 text-accent-foreground" },
  { id: "offer", label: "Offer", tone: "bg-success/15 text-success" },
  { id: "rejected", label: "Rejected", tone: "bg-destructive/10 text-destructive" },
];

function TrackerPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) toast.error(error.message);
      else setJobs((data ?? []) as Job[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_applications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setJobs((prev) => {
            if (payload.eventType === "INSERT") {
              const next = payload.new as Job;
              if (prev.some((j) => j.id === next.id)) return prev;
              return [next, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const next = payload.new as Job;
              return prev.map((j) => (j.id === next.id ? { ...j, ...next } : j));
            }
            if (payload.eventType === "DELETE") {
              const old = payload.old as Job;
              return prev.filter((j) => j.id !== old.id);
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const grouped = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const c of COLUMNS) map[c.id] = [];
    for (const j of jobs) {
      const key = map[j.status] ? j.status : "wishlist";
      map[key].push(j);
    }
    return map;
  }, [jobs]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const interviews = jobs.filter((j) => ["interview", "technical", "final_round"].includes(j.status)).length;
    const offers = jobs.filter((j) => j.status === "offer").length;
    const responseRate = total > 0 ? Math.round(((interviews + offers + jobs.filter((j) => j.status === "rejected").length) / total) * 100) : 0;
    return { total, interviews, offers, responseRate };
  }, [jobs]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const id = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    const job = jobs.find((j) => j.id === id);
    if (!job || job.status === overId) return;
    const newStatus = overId;
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
    const update: { status: string; applied_date?: string } = { status: newStatus };
    if (newStatus === "applied" && !job.applied_date) update.applied_date = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("job_applications").update(update).eq("id", id);
    if (error) {
      toast.error("Failed to move card");
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: job.status } : j)));
    }
  };

  const activeJob = activeId ? jobs.find((j) => j.id === activeId) ?? null : null;

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Application Tracker</h1>
          <p className="text-muted-foreground mt-1">Drag cards across columns to update their status.</p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="w-4 h-4 mr-2" /> Add application
            </Button>
          </DialogTrigger>
          <AddJobDialog onClose={() => setOpenAdd(false)} userId={user?.id ?? ""} />
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Total" value={stats.total} icon={Briefcase} />
        <MiniStat label="In interviews" value={stats.interviews} icon={CalendarIcon} accent="warning" />
        <MiniStat label="Offers" value={stats.offers} icon={Star} accent="success" />
        <MiniStat label="Response rate" value={`${stats.responseRate}%`} icon={DollarSign} accent="primary" />
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 snap-x">
            {COLUMNS.map((col) => (
              <Column key={col.id} column={col} jobs={grouped[col.id] ?? []} />
            ))}
          </div>
          <DragOverlay>{activeJob ? <JobCard job={activeJob} dragging /> : null}</DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: any; accent?: string }) {
  const map: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg grid place-items-center ${map[accent ?? ""] ?? "bg-muted text-muted-foreground"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function Column({ column, jobs }: { column: { id: string; label: string; tone: string }; jobs: Job[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={`snap-start shrink-0 w-72 rounded-2xl border bg-card/60 backdrop-blur p-3 transition ${
        isOver ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${column.tone}`}>{column.label}</span>
          <span className="text-xs text-muted-foreground">{jobs.length}</span>
        </div>
      </div>
      <div className="space-y-2 min-h-24">
        {jobs.map((j) => (
          <DraggableCard key={j.id} job={j} />
        ))}
        {jobs.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`touch-none ${isDragging ? "opacity-30" : ""}`}
    >
      <JobCard job={job} />
    </div>
  );
}

function JobCard({ job, dragging }: { job: Job; dragging?: boolean }) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${job.job_title} at ${job.company_name}?`)) return;
    const { error } = await supabase.from("job_applications").delete().eq("id", job.id);
    if (error) toast.error(error.message);
    else toast.success("Deleted");
  };
  return (
    <div
      className={`rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-card transition cursor-grab active:cursor-grabbing ${
        dragging ? "ring-2 ring-primary shadow-glow rotate-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm leading-tight truncate">{job.job_title || "Untitled role"}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.company_name || "Unknown"}</span>
          </div>
        </div>
        {job.job_url && (
          <a
            href={job.job_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {job.location && (
          <Badge variant="outline" className="text-[10px] py-0 h-5">
            <MapPin className="w-2.5 h-2.5 mr-0.5" /> {job.location}
          </Badge>
        )}
        {job.job_type && (
          <Badge variant="secondary" className="text-[10px] py-0 h-5 capitalize">
            {job.job_type.replace("_", " ")}
          </Badge>
        )}
        {!!job.salary_offered && job.salary_offered > 0 && (
          <Badge variant="outline" className="text-[10px] py-0 h-5">
            ${(job.salary_offered / 1000).toFixed(0)}k
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < (job.excitement_level ?? 0) ? "fill-warning text-warning" : "text-muted"}`}
            />
          ))}
        </div>
        <button
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive transition opacity-60 hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function AddJobDialog({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [form, setForm] = useState({
    company_name: "",
    job_title: "",
    job_url: "",
    location: "",
    job_type: "full_time",
    status: "wishlist",
    salary_offered: "",
    excitement_level: 3,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.job_title) {
      toast.error("Company and role are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("job_applications").insert({
      user_id: userId,
      company_name: form.company_name,
      job_title: form.job_title,
      job_url: form.job_url || null,
      location: form.location || null,
      job_type: form.job_type,
      status: form.status,
      salary_offered: form.salary_offered ? Number(form.salary_offered) : 0,
      excitement_level: form.excitement_level,
      notes: form.notes || null,
      applied_date: form.status === "applied" ? new Date().toISOString().slice(0, 10) : null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Application added");
    onClose();
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Add application</DialogTitle>
        <DialogDescription>Track a new role across your pipeline.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Company *</Label>
            <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Job URL</Label>
          <Input type="url" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} placeholder="https://…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Salary (USD)</Label>
            <Input type="number" value={form.salary_offered} onChange={(e) => setForm({ ...form, salary_offered: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLUMNS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Excitement: {form.excitement_level}/5</Label>
          <input
            type="range"
            min={1}
            max={5}
            value={form.excitement_level}
            onChange={(e) => setForm({ ...form, excitement_level: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-gradient-primary">
            {saving ? "Adding…" : "Add application"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
