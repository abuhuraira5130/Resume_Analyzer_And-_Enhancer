import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Briefcase, Target, Link2, Loader2, Save, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { backendGet, backendPost } from "@/lib/backend";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

type ProfileForm = {
  full_name: string;
  email: string;
  current_title: string;
  current_company: string;
  location: string;
  years_of_experience: string;
  target_role: string;
  target_salary_min: string;
  target_salary_max: string;
  target_location: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
};

type AISettings = {
  provider: string;
  model: string;
  api_key: string;
};

const emptyProfile: ProfileForm = {
  full_name: "", email: "", current_title: "", current_company: "", location: "",
  years_of_experience: "", target_role: "", target_salary_min: "", target_salary_max: "",
  target_location: "", linkedin_url: "", github_url: "", portfolio_url: "",
};

const FALLBACK_PROVIDERS: Record<string, { name: string; models: string[] }> = {
  gemini: {
    name: "Google Gemini",
    models: [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-pro",
      "gemini-1.5-flash"
    ]
  },
  groq: {
    name: "Groq",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.3-8b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "llama3-70b-8192",
      "llama3-8b-8192",
      "mixtral-8x7b-32768",
      "gemma-7b-it"
    ]
  }
};

const emptyAISettings: AISettings = {
  provider: "gemini",
  model: "gemini-2.5-flash",
  api_key: "",
};

function ProfilePage() {
  const { user, session } = useAuth();
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [aiSettings, setAISettings] = useState<AISettings>(emptyAISettings);
  const [providers, setProviders] = useState<Record<string, { name: string; models: string[] }>>(FALLBACK_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAISettings, setSavingAISettings] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTested, setConnectionTested] = useState<{ success: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        // Load profile
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (data) {
          setProfileForm({
            full_name: data.full_name ?? "",
            email: data.email ?? user.email ?? "",
            current_title: data.current_title ?? "",
            current_company: data.current_company ?? "",
            location: data.location ?? "",
            years_of_experience: String(data.years_of_experience ?? ""),
            target_role: data.target_role ?? "",
            target_salary_min: String(data.target_salary_min ?? ""),
            target_salary_max: String(data.target_salary_max ?? ""),
            target_location: data.target_location ?? "",
            linkedin_url: data.linkedin_url ?? "",
            github_url: data.github_url ?? "",
            portfolio_url: data.portfolio_url ?? "",
          });
        }

        // Load AI providers (with fallback)
        try {
          const providersData = await backendGet<{ providers: Record<string, { name: string; models: string[] }> }>("/api/ai/providers");
          setProviders(providersData.providers);
        } catch (e) {
          console.warn("Failed to load providers from API, using fallback", e);
          setProviders(FALLBACK_PROVIDERS);
        }

        // Load user AI settings
        if (session) {
          try {
            const settingsData = await backendGet<{ settings: AISettings }>("/api/ai/settings", session.access_token);
            if (settingsData.settings) {
              setAISettings(settingsData.settings);
            }
          } catch (e) {
            console.warn("Failed to load user AI settings", e);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, session]);

  const setProfileField = (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfileForm(f => ({ ...f, [k]: e.target.value }));

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profileForm.full_name,
      current_title: profileForm.current_title,
      current_company: profileForm.current_company,
      location: profileForm.location,
      years_of_experience: Number(profileForm.years_of_experience) || 0,
      target_role: profileForm.target_role,
      target_salary_min: Number(profileForm.target_salary_min) || 0,
      target_salary_max: Number(profileForm.target_salary_max) || 0,
      target_location: profileForm.target_location,
      linkedin_url: profileForm.linkedin_url,
      github_url: profileForm.github_url,
      portfolio_url: profileForm.portfolio_url,
      is_onboarded: true,
    }).eq("id", user.id);
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  async function saveAISettings() {
    if (!session) return;
    setSavingAISettings(true);
    try {
      await backendPost("/api/ai/settings/save", aiSettings, session.access_token);
      toast.success("AI settings saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingAISettings(false);
    }
  }

  async function testConnection() {
    if (!session) return;
    setTestingConnection(true);
    setConnectionTested(null);
    try {
      const result = await backendPost<{ success: boolean; error?: string }>(
        "/api/ai/test-connection",
        aiSettings,
        session.access_token
      );
      setConnectionTested({
        success: result.success,
        message: result.success ? "Connection successful!" : result.error || "Connection failed",
      });
      if (result.success) toast.success("Connection successful!");
      else toast.error(result.error || "Connection failed");
    } catch (e: any) {
      setConnectionTested({ success: false, message: e.message });
      toast.error(e.message);
    } finally {
      setTestingConnection(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 grid place-items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Power up your AI analyses with richer context.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><User className="w-5 h-5" /></div>
              <div>
                <CardTitle>Personal</CardTitle>
                <CardDescription>Basic identity information.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Field label="Full name"><Input value={profileForm.full_name} onChange={setProfileField("full_name")} placeholder="Jane Doe" /></Field>
            <Field label="Email"><Input value={profileForm.email} disabled /></Field>
            <Field label="Location"><Input value={profileForm.location} onChange={setProfileField("location")} placeholder="Berlin, Germany" /></Field>
            <Field label="Years of experience"><Input type="number" step="0.5" value={profileForm.years_of_experience} onChange={setProfileField("years_of_experience")} placeholder="5" /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning grid place-items-center"><Briefcase className="w-5 h-5" /></div>
              <div>
                <CardTitle>Current role</CardTitle>
                <CardDescription>Where you are right now.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Field label="Current title"><Input value={profileForm.current_title} onChange={setProfileField("current_title")} placeholder="Senior Frontend Engineer" /></Field>
            <Field label="Current company"><Input value={profileForm.current_company} onChange={setProfileField("current_company")} placeholder="Acme Inc." /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success grid place-items-center"><Target className="w-5 h-5" /></div>
              <div>
                <CardTitle>Career goals</CardTitle>
                <CardDescription>Your target — used to tailor analyses.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Field label="Target role"><Input value={profileForm.target_role} onChange={setProfileField("target_role")} placeholder="Staff Engineer" /></Field>
            <Field label="Target location"><Input value={profileForm.target_location} onChange={setProfileField("target_location")} placeholder="Remote / EU" /></Field>
            <Field label="Target salary min (USD)"><Input type="number" value={profileForm.target_salary_min} onChange={setProfileField("target_salary_min")} placeholder="120000" /></Field>
            <Field label="Target salary max (USD)"><Input type="number" value={profileForm.target_salary_max} onChange={setProfileField("target_salary_max")} placeholder="180000" /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Link2 className="w-5 h-5" /></div>
              <div>
                <CardTitle>Links</CardTitle>
                <CardDescription>Public profiles for richer context.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Field label="LinkedIn"><Input value={profileForm.linkedin_url} onChange={setProfileField("linkedin_url")} placeholder="https://linkedin.com/in/..." /></Field>
            <Field label="GitHub"><Input value={profileForm.github_url} onChange={setProfileField("github_url")} placeholder="https://github.com/..." /></Field>
            <Field label="Portfolio"><Input value={profileForm.portfolio_url} onChange={setProfileField("portfolio_url")} placeholder="https://..." /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Settings className="w-5 h-5" /></div>
              <div>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure your AI provider and model for resume analysis.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="AI Provider">
                <Select
                  value={aiSettings.provider}
                  onValueChange={(value) => {
                    const newProvider = providers[value];
                    setAISettings({
                      ...aiSettings,
                      provider: value,
                      model: newProvider.models[0],
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(providers).map(([key, p]) => (
                      <SelectItem key={key} value={key}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Model">
                <Select
                  value={aiSettings.model}
                  onValueChange={(value) => setAISettings({ ...aiSettings, model: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers[aiSettings.provider]?.models.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="API Key">
              <Input
                type="password"
                value={aiSettings.api_key}
                onChange={(e) => setAISettings({ ...aiSettings, api_key: e.target.value })}
                placeholder={`Enter your ${providers[aiSettings.provider]?.name || ''} API key`}
              />
            </Field>
            {connectionTested && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                connectionTested.success
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {connectionTested.success ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{connectionTested.message}</span>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={testConnection} disabled={testingConnection || !aiSettings.api_key} variant="outline">
                {testingConnection ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test Connection
              </Button>
              <Button onClick={saveAISettings} disabled={savingAISettings}>
                {savingAISettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save AI Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end sticky bottom-4">
          <Button type="submit" onClick={saveProfile} disabled={savingProfile} size="lg" className="bg-gradient-primary shadow-glow">
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingProfile ? "Saving Profile…" : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
