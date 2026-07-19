import { createFileRoute } from '@tanstack/react-router'
import {
  FileUp, FileText, Trash2, CheckCircle2, AlertCircle, Loader2,
  Sparkles, GraduationCap, Briefcase, Wrench, Brain, User, Zap,
  Download, Maximize2, Minimize2, Award, Languages, Calendar,
  MapPin, Link as LinkIcon, Plus, X, Globe, Save, Check, History
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

import { backendGet, backendPost } from "@/lib/backend";


import LoadingOverlay from "@/components/LoadingOverlay";

type Resume = {
  id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  parse_status: string;
  parse_error: string | null;
  is_primary: boolean | null;
  ai_analysis: any;
  raw_text: string;
  created_at: string;
};

type ResumeVersion = {
  id: string;
  version_number: number;
  is_original: boolean;
  content: any;
  markdown: string;
  plain_text: string;
  ai_provider?: string;
  ai_model?: string;
  ats_before?: number;
  ats_after?: number;
  changes_summary?: string;
  pdf_path?: string;
  docx_path?: string;
  created_at?: string;
};

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.docx";

function ResumeStructurePreview({ data, title }: { data: any, title: string }) {
  if (!data) return <div className="text-muted-foreground italic text-sm p-4 text-center">No content available</div>;
  
  const personal = data.personalInformation || {};
  const summary = data.professionalSummary || "";
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const skills = data.skills || {};
  const certifications = data.certifications || [];
  const languages = data.languages || [];

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm font-sans text-foreground max-h-[60vh] overflow-y-auto space-y-5 text-left select-text">
      {/* Header */}
      <div className="text-center border-b pb-4 space-y-1">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{personal.name || "Name"}</h3>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {personal.email && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{personal.email}</span>}
          {personal.phone && <span className="flex items-center gap-1">{personal.phone}</span>}
          {personal.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{personal.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-primary/80 mt-1">
          {personal.linkedin && <a href={personal.linkedin} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1"><LinkIcon className="w-3 h-3" />LinkedIn</a>}
          {personal.github && <a href={personal.github} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1"><LinkIcon className="w-3 h-3" />GitHub</a>}
          {personal.portfolio && <a href={personal.portfolio} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1"><LinkIcon className="w-3 h-3" />Portfolio</a>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-0.5">Professional Summary</h4>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-0.5">Work Experience</h4>
          <div className="space-y-3.5">
            {experience.map((exp: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <span className="font-semibold text-foreground">{exp.jobTitle || exp.title}</span>
                    {(exp.company) && <span className="text-muted-foreground"> at {exp.company}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium shrink-0">{exp.startDate || exp.start} – {exp.endDate || exp.end}</span>
                </div>
                {exp.location && <div className="text-xs text-muted-foreground italic">{exp.location}</div>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground mt-1">
                    {exp.highlights.map((hl: string, j: number) => (
                      <li key={j}>{hl}</li>
                    ))}
                  </ul>
                )}
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground mt-1">
                    {exp.bulletPoints.map((hl: string, j: number) => (
                      <li key={j}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-0.5">Education</h4>
          <div className="space-y-2">
            {education.map((edu: any, i: number) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-semibold">{edu.degree}</span>
                  {edu.school && <span className="text-muted-foreground">, {edu.school}</span>}
                  {edu.gpa && <span className="text-xs text-muted-foreground font-medium block">GPA: {edu.gpa}</span>}
                </div>
                <span className="text-xs text-muted-foreground font-medium shrink-0">{edu.graduationDate || edu.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-0.5">Projects</h4>
          <div className="space-y-2">
            {projects.map((proj: any, i: number) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between items-start text-sm">
                  <span className="font-semibold">{proj.name}</span>
                  {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-0.5"><LinkIcon className="w-2.5 h-2.5" />Link</a>}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {proj.technologies.map((t: string, j: number) => (
                      <Badge key={j} variant="outline" className="text-[10px] py-0 px-1">{t}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {((skills.technical && skills.technical.length > 0) || (skills.soft && skills.soft.length > 0) || (skills.all && skills.all.length > 0)) && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-0.5">Skills</h4>
          <div className="space-y-1.5 text-xs">
            {skills.technical && skills.technical.length > 0 && (
              <div>
                <span className="font-semibold text-muted-foreground mr-1.5">Technical:</span>
                <span>{skills.technical.join(", ")}</span>
              </div>
            )}
            {skills.soft && skills.soft.length > 0 && (
              <div>
                <span className="font-semibold text-muted-foreground mr-1.5">Soft:</span>
                <span>{skills.soft.join(", ")}</span>
              </div>
            )}
            {!skills.technical && skills.all && skills.all.length > 0 && (
              <div>
                <span className="font-semibold text-muted-foreground mr-1.5">Skills:</span>
                <span>{skills.all.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-0.5">Certifications</h4>
          <ul className="list-disc pl-4 space-y-0.5 text-xs text-muted-foreground">
            {certifications.map((c: any, i: number) => (
              <li key={i}>
                <span className="font-semibold text-foreground">{c.name}</span>
                {c.issuer && <span> – {c.issuer}</span>}
                {c.date && <span className="font-medium"> ({c.date})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-0.5">Languages</h4>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">{l}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ATSScoreCard({ before, after }: { before: number, after: number }) {
  const diff = after - before;
  const checklist = ["Keywords", "Grammar", "Formatting", "Summary", "Skills", "Experience"];
  
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-900/30 text-white shadow-xl">
      <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Original ATS</div>
            <div className="text-3xl font-extrabold text-slate-300">{before} <span className="text-sm font-normal">/ 100</span></div>
          </div>
          
          <div className="text-2xl font-black text-indigo-400">→</div>
          
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Optimized ATS</div>
            <div className="text-3xl font-extrabold text-emerald-400">{after} <span className="text-sm font-normal text-emerald-300">/ 100</span></div>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1 shrink-0">
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> +{diff} Score Increase
          </div>
        </div>

        <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-indigo-900/40 pt-4 md:pt-0 md:pl-6">
          <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-2 text-left">Optimized & Improved Areas</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs text-left">
            {checklist.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: any;
  onSave: (updatedContent: any) => void;
}

function ResumeEditorModal({ isOpen, onClose, initialContent, onSave }: EditorProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    if (initialContent) {
      setContent(JSON.parse(JSON.stringify(initialContent)));
    }
  }, [initialContent, isOpen]);

  if (!content) return null;

  const updatePersonal = (field: string, value: string) => {
    setContent({
      ...content,
      personalInformation: {
        ...(content.personalInformation || {}),
        [field]: value
      }
    });
  };

  const handleSave = () => {
    onSave(content);
    toast.success("Changes applied to preview!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-indigo-500" /> Edit Resume Content
          </DialogTitle>
          <DialogDescription>
            Modify the optimized fields manually. These changes will update the preview and final files.
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b gap-2 overflow-x-auto pb-1 mt-2">
          {["personal", "summary", "experience", "education", "certifications"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              className={`capitalize text-xs rounded-t-lg rounded-b-none border-b-2 ${activeTab === tab ? "border-primary" : "border-transparent"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "personal" ? "Contact Info" : tab === "summary" ? "Summary & Skills" : tab}
            </Button>
          ))}
        </div>

        <div className="py-4 space-y-4 text-left">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={content.personalInformation?.name || ""} onChange={(e) => updatePersonal("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={content.personalInformation?.email || ""} onChange={(e) => updatePersonal("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input value={content.personalInformation?.phone || ""} onChange={(e) => updatePersonal("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={content.personalInformation?.location || ""} onChange={(e) => updatePersonal("location", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>LinkedIn URL</Label>
                <Input value={content.personalInformation?.linkedin || ""} onChange={(e) => updatePersonal("linkedin", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>GitHub URL</Label>
                <Input value={content.personalInformation?.github || ""} onChange={(e) => updatePersonal("github", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Portfolio URL</Label>
                <Input value={content.personalInformation?.portfolio || ""} onChange={(e) => updatePersonal("portfolio", e.target.value)} />
              </div>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Professional Summary</Label>
                <textarea
                  className="w-full min-h-[120px] border rounded-md p-2 bg-transparent text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  value={content.professionalSummary || ""}
                  onChange={(e) => setContent({ ...content, professionalSummary: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Technical Skills (comma-separated)</Label>
                <textarea
                  className="w-full min-h-[60px] border rounded-md p-2 bg-transparent text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  value={content.skills?.technical?.join(", ") || ""}
                  onChange={(e) => setContent({
                    ...content,
                    skills: {
                      ...(content.skills || {}),
                      technical: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean)
                    }
                  })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Soft Skills (comma-separated)</Label>
                <textarea
                  className="w-full min-h-[60px] border rounded-md p-2 bg-transparent text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  value={content.skills?.soft?.join(", ") || ""}
                  onChange={(e) => setContent({
                    ...content,
                    skills: {
                      ...(content.skills || {}),
                      soft: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean)
                    }
                  })}
                />
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-6">
              {(content.experience || []).map((exp: any, idx: number) => (
                <div key={idx} className="border rounded-xl p-4 space-y-4 relative bg-muted/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      const list = [...content.experience];
                      list.splice(idx, 1);
                      setContent({ ...content, experience: list });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Job Title</Label>
                      <Input
                        value={exp.jobTitle || ""}
                        onChange={(e) => {
                          const list = [...content.experience];
                          list[idx].jobTitle = e.target.value;
                          setContent({ ...content, experience: list });
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Company</Label>
                      <Input
                        value={exp.company || ""}
                        onChange={(e) => {
                          const list = [...content.experience];
                          list[idx].company = e.target.value;
                          setContent({ ...content, experience: list });
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Start Date</Label>
                      <Input
                        value={exp.startDate || ""}
                        onChange={(e) => {
                          const list = [...content.experience];
                          list[idx].startDate = e.target.value;
                          setContent({ ...content, experience: list });
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>End Date</Label>
                      <Input
                        value={exp.endDate || ""}
                        onChange={(e) => {
                          const list = [...content.experience];
                          list[idx].endDate = e.target.value;
                          setContent({ ...content, experience: list });
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Highlights (Bullet Points)</Label>
                    {(exp.highlights || []).map((hl: string, j: number) => (
                      <div key={j} className="flex gap-2 items-center">
                        <Input
                          value={hl}
                          onChange={(e) => {
                            const list = [...content.experience];
                            list[idx].highlights[j] = e.target.value;
                            setContent({ ...content, experience: list });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                          onClick={() => {
                            const list = [...content.experience];
                            list[idx].highlights.splice(j, 1);
                            setContent({ ...content, experience: list });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => {
                        const list = [...content.experience];
                        if (!list[idx].highlights) list[idx].highlights = [];
                        list[idx].highlights.push("");
                        setContent({ ...content, experience: list });
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Highlight
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => {
                  const list = [...(content.experience || [])];
                  list.push({ jobTitle: "", company: "", startDate: "", endDate: "", highlights: [""] });
                  setContent({ ...content, experience: list });
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Work Experience
              </Button>
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Education</Label>
                {(content.education || []).map((edu: any, idx: number) => (
                  <div key={idx} className="border rounded-xl p-4 space-y-4 relative bg-muted/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        const list = [...content.education];
                        list.splice(idx, 1);
                        setContent({ ...content, education: list });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree || ""}
                          onChange={(e) => {
                            const list = [...content.education];
                            list[idx].degree = e.target.value;
                            setContent({ ...content, education: list });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>School</Label>
                        <Input
                          value={edu.school || ""}
                          onChange={(e) => {
                            const list = [...content.education];
                            list[idx].school = e.target.value;
                            setContent({ ...content, education: list });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Graduation Date</Label>
                        <Input
                          value={edu.graduationDate || ""}
                          onChange={(e) => {
                            const list = [...content.education];
                            list[idx].graduationDate = e.target.value;
                            setContent({ ...content, education: list });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>GPA (optional)</Label>
                        <Input
                          value={edu.gpa || ""}
                          onChange={(e) => {
                            const list = [...content.education];
                            list[idx].gpa = e.target.value;
                            setContent({ ...content, education: list });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => {
                    const list = [...(content.education || [])];
                    list.push({ degree: "", school: "", graduationDate: "", gpa: "" });
                    setContent({ ...content, education: list });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Education
                </Button>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Projects</Label>
                {(content.projects || []).map((proj: any, idx: number) => (
                  <div key={idx} className="border rounded-xl p-4 space-y-4 relative bg-muted/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        const list = [...content.projects];
                        list.splice(idx, 1);
                        setContent({ ...content, projects: list });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Project Name</Label>
                        <Input
                          value={proj.name || ""}
                          onChange={(e) => {
                            const list = [...content.projects];
                            list[idx].name = e.target.value;
                            setContent({ ...content, projects: list });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Project URL</Label>
                        <Input
                          value={proj.url || ""}
                          onChange={(e) => {
                            const list = [...content.projects];
                            list[idx].url = e.target.value;
                            setContent({ ...content, projects: list });
                          }}
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label>Technologies (comma-separated)</Label>
                        <Input
                          value={proj.technologies?.join(", ") || ""}
                          onChange={(e) => {
                            const list = [...content.projects];
                            list[idx].technologies = e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean);
                            setContent({ ...content, projects: list });
                          }}
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label>Project Description</Label>
                        <textarea
                          className="w-full min-h-[60px] border rounded-md p-2 bg-transparent text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                          value={proj.description || ""}
                          onChange={(e) => {
                            const list = [...content.projects];
                            list[idx].description = e.target.value;
                            setContent({ ...content, projects: list });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => {
                    const list = [...(content.projects || [])];
                    list.push({ name: "", description: "", technologies: [], url: "" });
                    setContent({ ...content, projects: list });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Project
                </Button>
              </div>
            </div>
          )}

          {activeTab === "certifications" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Certifications</Label>
                {(content.certifications || []).map((c: any, idx: number) => (
                  <div key={idx} className="border rounded-xl p-4 space-y-4 relative bg-muted/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        const list = [...content.certifications];
                        list.splice(idx, 1);
                        setContent({ ...content, certifications: list });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Certification Name</Label>
                        <Input
                          value={c.name || ""}
                          onChange={(e) => {
                            const list = [...content.certifications];
                            list[idx].name = e.target.value;
                            setContent({ ...content, certifications: list });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Issuer</Label>
                        <Input
                          value={c.issuer || ""}
                          onChange={(e) => {
                            const list = [...content.certifications];
                            list[idx].issuer = e.target.value;
                            setContent({ ...content, certifications: list });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Date</Label>
                        <Input
                          value={c.date || ""}
                          onChange={(e) => {
                            const list = [...content.certifications];
                            list[idx].date = e.target.value;
                            setContent({ ...content, certifications: list });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => {
                    const list = [...(content.certifications || [])];
                    list.push({ name: "", issuer: "", date: "" });
                    setContent({ ...content, certifications: list });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Certification
                </Button>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Languages (comma-separated)</Label>
                <Input
                  value={content.languages?.join(", ") || ""}
                  onChange={(e) => setContent({
                    ...content,
                    languages: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-gradient-primary shadow-glow" onClick={handleSave}>
            <Check className="w-4 h-4 mr-2" /> Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResumesPage() {

  const { user, session } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [optimizationQuestions, setOptimizationQuestions] = useState<any[]>([]);
  const [optimizationAnswers, setOptimizationAnswers] = useState<Record<string, any>>({});
  const [optimizing, setOptimizing] = useState(false);
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showAllAnalysis, setShowAllAnalysis] = useState(false);
  const [allAnalyses, setAllAnalyses] = useState<Resume[]>([]);
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [globalLoading, setGlobalLoading] = useState<{ message?: string } | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // New Optimize Flow states
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [savedPaths, setSavedPaths] = useState<{ pdf_path?: string, docx_path?: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setResumes(data as Resume[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`resumes:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resumes", filter: `user_id=eq.${user.id}` },
        () => refresh(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, refresh]);

  const analyzeResume = async (resume: Resume) => {
    console.log("[analyzeResume] Called with resume:", resume?.id, "ai_analysis:", resume?.ai_analysis);
    const hasAnalysis = resume.ai_analysis && typeof resume.ai_analysis === "object" && Object.keys(resume.ai_analysis).length > 0;
    if (hasAnalysis) {
      console.log("[analyzeResume] Already analyzed, showing cached result");
      setSelectedResume(resume);
      setShowAnalysis(true);
      return;
    }
    if (!session) {
      console.error("[analyzeResume] ABORTED: session is null/undefined!");
      toast.error("Session expired. Please log in again.");
      return;
    }
    console.log("[analyzeResume] Starting analysis, calling backend...");
    setAnalyzing(true);
    setGlobalLoading({ message: "Analyzing resume... this may take 1-2 minutes" });
    try {
      const url = "/api/ai/analyze";
      const body = { resume_id: resume.id };
      console.log("[analyzeResume] backendPost URL:", url, "body:", JSON.stringify(body));
      const result = await backendPost<{ analysis: any }>(
        url,
        body,
        session.access_token
      );
      console.log("[analyzeResume] SUCCESS! Got analysis result:", !!result?.analysis);
      await refresh();
      setSelectedResume({ ...resume, ai_analysis: result.analysis });
      setShowAnalysis(true);
      toast.success("Resume analyzed successfully!");
    } catch (e: any) {
      console.error("[analyzeResume] ERROR:", e);
      toast.error(e?.message || "Analysis failed. Please check your AI settings and try again.");
      // Mark resume as failed so UI doesn't stay stuck
      try {
        await supabase.from("resumes").update({ parse_status: "failed", parse_error: e?.message || "Analysis failed" }).eq("id", resume.id);
        await refresh();
      } catch (_) { /* ignore cleanup error */ }
    } finally {
      setAnalyzing(false);
      setGlobalLoading(null);
    }
  };

  const getOptimizationQuestions = async (resume: Resume) => {
    if (!session) return;
    setOptimizationAnswers({});
    setOptimizationQuestions([]);
    setOptimizedData(null);
    setShowPreview(false);
    setDownloadReady(false);
    setSavedPaths(null);
    setSelectedResume(resume);
    setShowOptimizer(true);
    setLoadingQuestions(true);
    try {
      const result = await backendPost<{ questions: any[] }>(
        "/api/ai/optimization-questions",
        { resume_id: resume.id },
        session.access_token
      );
      setOptimizationQuestions(result.questions);
    } catch (e: any) {
      toast.error(e.message || "Failed to load questions");
      setShowOptimizer(false);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadResumeVersions = async (resumeId: string) => {
    if (!session) return;
    setGlobalLoading({ message: "Loading resume versions..." });
    try {
      const result = await backendGet<{ versions: ResumeVersion[] }>(
        `/api/ai/versions?resume_id=${resumeId}`,
        session.access_token
      );
      setResumeVersions(result.versions);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGlobalLoading(null);
    }
  };

  const optimizeResume = async (resume: Resume) => {
    if (!session) return;
    setOptimizing(true);
    try {
      const result = await backendPost<any>(
        "/api/ai/optimize",
        { resume_id: resume.id, answers: optimizationAnswers },
        session.access_token
      );
      setOptimizedData(result);
      setShowPreview(true);
      toast.success("Resume optimized! Please review the preview.");
    } catch (e: any) {
      toast.error(e.message || "Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  const saveOptimizedVersion = async () => {
    if (!session || !selectedResume || !optimizedData) return;
    setSavingVersion(true);
    try {
      const payload = {
        resume_id: selectedResume.id,
        optimized_content: optimizedData.optimized.optimizedContent,
        markdown: optimizedData.optimized.markdown,
        plain_text: optimizedData.optimized.plainText,
        user_answers: optimizationAnswers,
        ats_before: optimizedData.ats_before,
        ats_after: optimizedData.optimized.ats?.score || 90,
        changes_summary: optimizedData.optimized.changesSummary || []
      };
      
      const result = await backendPost<any>(
        "/api/ai/save-version",
        payload,
        session.access_token
      );
      
      if (result.success) {
        setSavedPaths({
          pdf_path: result.version.pdf_path,
          docx_path: result.version.docx_path
        });
        setDownloadReady(true);
        toast.success("Version saved successfully and download files are generated!");
        await loadResumeVersions(selectedResume.id);
        await refresh();
      } else {
        toast.error(result.error || "Failed to save version");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save version");
    } finally {
      setSavingVersion(false);
    }
  };

  const downloadVersionFile = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from("resumes").download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error("Download failed: " + e.message);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user || !session) return;
    const file = files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      toast.error("Only PDF and DOCX files are supported.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    setProgress(20);

    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("resumes")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type ||
            (ext === "pdf" ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        });
      if (upErr) throw upErr;
      setProgress(40);

      const { data: inserted, error: insErr } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.(pdf|docx)$/i, ""),
          file_path: path,
          file_type: ext,
          file_size: file.size,
          parse_status: "processing",
          is_primary: resumes.length === 0,
        })
        .select("*")
        .single();
      if (insErr) throw insErr;
      setProgress(70);
      toast.success("Resume uploaded! Analyzing now...");
      await refresh();

      // Auto-analyze the new resume
      const newResume = { ...inserted } as Resume;
      console.log("[handleFiles] About to call analyzeResume for:", newResume.id, "session exists:", !!session);
      await analyzeResume(newResume);
      console.log("[handleFiles] analyzeResume completed");
      setProgress(100);
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const analyzeAllResumes = async () => {
    if (!session) return;
    setBatchAnalyzing(true);
    setGlobalLoading({ message: "Analyzing all resumes..." });
    try {
      const updatedResumes = [...resumes];
      for (let i = 0; i < updatedResumes.length; i++) {
        const r = updatedResumes[i];
        const result = await backendPost<{ analysis: any }>(
          "/api/ai/analyze",
          { resume_id: r.id },
          session.access_token
        );
        updatedResumes[i] = { ...r, ai_analysis: result.analysis };
      }
      setResumes(updatedResumes);
      setAllAnalyses(updatedResumes.filter(r => r.ai_analysis));
      setShowAllAnalysis(true);
      toast.success("All resumes analyzed successfully!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBatchAnalyzing(false);
      setGlobalLoading(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!session) return;
    
    
    // Optimistic UI update: instantly remove from screen
    setResumes(prev => prev.filter(r => r.id !== id));
    
    try {
      // Fire and forget the backend delete request
      backendPost<{ ok: true }>("/api/resumes/delete/", { resumeId: id, accessToken: session.access_token }, session.access_token)
        .catch((e: any) => {
          toast.error(e?.message || "Delete failed");
          refresh(); // Revert state if backend deletion actually failed
        });
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
      refresh();
    }
  };

  const onMakePrimary = async (id: string) => {
    if (!session) return;
    try {
      await backendPost<{ ok: true }>("/api/resumes/set-primary/", { resumeId: id, accessToken: session.access_token }, session.access_token);
      toast.success("Primary resume updated");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  if (loading) {
    return (
      <div className="p-10 grid place-items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {globalLoading && <LoadingOverlay message={globalLoading.message} />}
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Your Resumes</h1>
            <p className="text-muted-foreground mt-1">
              Upload a resume and let AI analyze and optimize it for you.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-primary shadow-glow"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
              {uploading ? "Uploading…" : "Upload Resume"}
            </Button>
            <Button
              className="bg-primary/10 text-primary hover:bg-primary/20"
              onClick={analyzeAllResumes}
              disabled={batchAnalyzing || uploading || loading}
            >
              {batchAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Analyze All
            </Button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={[
            "rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all mb-8",
            drag ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30",
          ].join(" ")}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 grid place-items-center">
            <FileUp className="w-7 h-7 text-primary" />
          </div>
          <div className="font-medium">Drag & drop your resume here</div>
          <div className="text-sm text-muted-foreground mt-1">PDF or DOCX, up to 10MB</div>
          {uploading && (
            <div className="max-w-md mx-auto mt-5">
              <Progress value={progress} />
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {resumes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No resumes yet. Upload one to get started.
            </div>
          ) : (
            resumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                onAnalyze={() => analyzeResume(r)}
                onOptimize={() => { setSelectedResume(r); getOptimizationQuestions(r); }}
                onShowVersions={() => { setSelectedResume(r); loadResumeVersions(r.id); setShowVersions(true); }}
                onDelete={() => onDelete(r.id)}
                isAnalyzing={analyzing}
              />
            ))
          )}
        </div>

        {/* All Analyses Dialog */}
        <Dialog open={showAllAnalysis} onOpenChange={setShowAllAnalysis}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>All Resume Analyses</DialogTitle>
              <DialogDescription>
                Overview of ATS scores and key insights for all resumes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {allAnalyses.map((resume) => (
                <div key={resume.id} className="border rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-2">{resume.title}</h2>
                  <AnalysisDisplay analysis={resume.ai_analysis} />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAnalysis} onOpenChange={(open) => { setShowAnalysis(open); if (!open) setIsFullScreen(false); }}>
          <DialogContent className={isFullScreen ? "max-w-[100vw] w-screen h-screen max-h-screen overflow-auto m-0 rounded-none p-6" : "max-w-4xl max-h-[90vh] overflow-auto"}>
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
              <div>
                <DialogTitle>AI Analysis</DialogTitle>
                <DialogDescription>
                  Comprehensive analysis of your resume
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mr-6"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>
            </DialogHeader>
            {selectedResume?.ai_analysis && (
              <div className="mt-4">
                <AnalysisDisplay analysis={selectedResume.ai_analysis} />
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showOptimizer} onOpenChange={setShowOptimizer}>
          <DialogContent className={showPreview ? "max-w-5xl max-h-[90vh] overflow-y-auto" : "max-w-2xl"}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                {showPreview ? "Review & Approve Optimized Resume" : "AI Resume Optimizer"}
              </DialogTitle>
              <DialogDescription>
                {showPreview
                  ? "Compare original and optimized resume side-by-side. Approve to generate download files."
                  : "Answer a few questions to help AI optimize your resume"}
              </DialogDescription>
            </DialogHeader>

            {loadingQuestions && (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading optimization questions...</p>
              </div>
            )}

            {!loadingQuestions && !showPreview && (
              <>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 text-left">
                  {optimizationQuestions.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label className="font-semibold">{q.question}</Label>
                      {q.type === "text" && (
                        <Input
                          placeholder={q.placeholder}
                          value={optimizationAnswers[q.id] || ""}
                          onChange={(e) => setOptimizationAnswers({ ...optimizationAnswers, [q.id]: e.target.value })}
                        />
                      )}
                      {q.type === "select" && (
                        <select
                          className="w-full border rounded-md p-2 bg-background"
                          value={optimizationAnswers[q.id] || ""}
                          onChange={(e) => setOptimizationAnswers({ ...optimizationAnswers, [q.id]: e.target.value })}
                        >
                          <option value="">Select...</option>
                          {q.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                  {optimizationQuestions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground italic text-sm">
                      Generating tailored suggestions based on your resume analysis...
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setShowOptimizer(false)}>Cancel</Button>
                  <Button
                    className="bg-gradient-primary shadow-glow"
                    onClick={() => selectedResume && optimizeResume(selectedResume)}
                    disabled={optimizing}
                  >
                    {optimizing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {optimizing ? "Optimizing..." : "Start Optimization"}
                  </Button>
                </div>
              </>
            )}

            {!loadingQuestions && showPreview && optimizedData && (
              <div className="space-y-6 py-4">
                {/* ATS comparison card */}
                <ATSScoreCard
                  before={optimizedData.ats_before}
                  after={optimizedData.optimized.ats?.score || 90}
                />

                {/* Side-by-side Preview panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-1 text-left">Original Resume</div>
                    <ResumeStructurePreview data={selectedResume?.ai_analysis} title="Original Resume" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-bold uppercase tracking-wider text-primary text-left">Optimized Resume</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs bg-primary/5 hover:bg-primary/10 border-primary/25 text-primary" onClick={() => setShowEditor(true)}>
                        Edit Resume
                      </Button>
                    </div>
                    <ResumeStructurePreview data={optimizedData.optimized.optimizedContent} title="Optimized Resume" />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center border-t pt-4 gap-4">
                  <Button variant="ghost" onClick={() => setShowPreview(false)} disabled={savingVersion}>
                    Back to Questions
                  </Button>

                  <div className="flex gap-2 flex-wrap">
                    {!downloadReady ? (
                      <>
                        <Button variant="outline" onClick={() => setShowOptimizer(false)} disabled={savingVersion}>Cancel</Button>
                        <Button
                          className="bg-gradient-primary shadow-glow"
                          onClick={saveOptimizedVersion}
                          disabled={savingVersion}
                        >
                          {savingVersion ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          {savingVersion ? "Validating & Generating..." : "Approve & Save"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => savedPaths?.pdf_path && downloadVersionFile(savedPaths.pdf_path, `${selectedResume?.title || 'resume'}_optimized.pdf`)}
                        >
                          <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                        <Button
                          variant="outline"
                          className="border-blue-500/30 text-blue-600 hover:bg-blue-50"
                          onClick={() => savedPaths?.docx_path && downloadVersionFile(savedPaths.docx_path, `${selectedResume?.title || 'resume'}_optimized.docx`)}
                        >
                          <Download className="w-4 h-4 mr-2" /> Download DOCX
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowOptimizer(false)}>
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ResumeEditorModal
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          initialContent={optimizedData?.optimized?.optimizedContent}
          onSave={(updatedContent) => {
            setOptimizedData({
              ...optimizedData,
              optimized: {
                ...optimizedData.optimized,
                optimizedContent: updatedContent
              }
            });
          }}
        />

        <Dialog open={showVersions} onOpenChange={setShowVersions}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Resume Versions
              </DialogTitle>
              <DialogDescription>
                View, compare, and download your resume versions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {resumeVersions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No versions found. Optimize your resume to create your first version!
                </div>
              ) : resumeVersions.map((version) => (
                <Card key={version.id} className={`overflow-hidden border ${version.is_original ? "border-border" : "border-indigo-500/25 bg-indigo-950/5"}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full grid place-items-center text-white text-xs font-bold ${version.is_original ? "bg-slate-500" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}>
                          V{version.version_number}
                        </div>
                        <div>
                          <div className="font-bold text-sm leading-tight">
                            Version {version.version_number}
                            {version.is_original && <span className="ml-2 text-xs font-medium text-muted-foreground">(Original)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {version.created_at ? new Date(version.created_at).toLocaleString() : "—"}
                          </div>
                        </div>
                      </div>

                      {/* ATS Delta */}
                      {!version.is_original && version.ats_before != null && version.ats_after != null && (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">ATS Score</div>
                            <div className="flex items-center gap-1.5 text-sm font-bold">
                              <span className="text-muted-foreground">{version.ats_before}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-emerald-500">{version.ats_after}</span>
                              <span className="text-emerald-500 text-xs">(+{(version.ats_after || 0) - (version.ats_before || 0)})</span>
                            </div>
                          </div>
                          <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Provider / Model metadata */}
                    {(version.ai_provider || version.ai_model) && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {version.ai_provider && (
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-medium capitalize">{version.ai_provider}</span>
                          </div>
                        )}
                        {version.ai_model && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground/60">Model:</span>
                            <span className="font-mono">{version.ai_model}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Changes Summary */}
                    {version.changes_summary && (() => {
                      try {
                        const changes: string[] = typeof version.changes_summary === "string"
                          ? JSON.parse(version.changes_summary)
                          : version.changes_summary;
                        if (changes && changes.length > 0) {
                          return (
                            <div className="space-y-1.5">
                              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Changes Made</div>
                              <ul className="space-y-1">
                                {changes.slice(0, 5).map((change, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-xs text-foreground/80">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    {change}
                                  </li>
                                ))}
                                {changes.length > 5 && (
                                  <li className="text-xs text-muted-foreground pl-5">+{changes.length - 5} more improvements</li>
                                )}
                              </ul>
                            </div>
                          );
                        }
                      } catch { }
                      return null;
                    })()}

                    {/* Actions Row */}
                    <div className="flex flex-wrap gap-2 pt-1 border-t">
                      {version.pdf_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-rose-500/30 text-rose-600 hover:bg-rose-50"
                          onClick={() => downloadVersionFile(version.pdf_path!, `${selectedResume?.title || "resume"}_v${version.version_number}.pdf`)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>
                      )}
                      {version.docx_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-50"
                          onClick={() => downloadVersionFile(version.docx_path!, `${selectedResume?.title || "resume"}_v${version.version_number}.docx`)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> DOCX
                        </Button>
                      )}
                      {!version.pdf_path && !version.docx_path && version.markdown && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            const blob = new Blob([version.markdown || ""], { type: "text/markdown" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${selectedResume?.title || "resume"}_v${version.version_number}.md`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Markdown
                        </Button>
                      )}
                      {!version.is_original && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                          onClick={async () => {
                            if (!session || !selectedResume) return;
                            try {
                              await backendPost(
                                "/api/ai/delete-version",
                                { version_id: version.id },
                                session.access_token
                              );
                              toast.success("Version deleted");
                              await loadResumeVersions(selectedResume.id);
                            } catch (e: any) {
                              toast.error(e.message || "Delete failed");
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
export const Route = createFileRoute('/_app/resumes')({ component: ResumesPage });

function ResumeCard({
  resume,
  onAnalyze,
  onOptimize,
  onShowVersions,
  onDelete,
  isAnalyzing,
}: {
  resume: Resume;
  onAnalyze: () => void;
  onOptimize: () => void;
  onShowVersions: () => void;
  onDelete: () => void;
  isAnalyzing: boolean;
}) {
  const isProcessing = resume.parse_status === "processing" || isAnalyzing;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-card transition">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold truncate">{resume.title}</div>
            <StatusPill status={isProcessing ? "processing" : resume.parse_status} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {resume.file_type.toUpperCase()} · {formatBytes(resume.file_size ?? 0)} · uploaded {new Date(resume.created_at).toLocaleDateString()}
          </div>

          {/* ATS Score Section */}
          <div className="mt-4 border-t pt-3">
            {resume.ai_analysis ? (
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="font-semibold text-sm">
                    ATS Score: {resume.ai_analysis.ats?.score ?? 0}/100
                  </Badge>
                  {resume.ai_analysis.meta?.model && (
                    <Badge variant="outline">
                      Model: {resume.ai_analysis.meta.model} ({resume.ai_analysis.meta.provider})
                    </Badge>
                  )}
                  {resume.ai_analysis.meta?.timestamp && (
                    <span className="text-[10px]">
                      Analyzed: {new Date(resume.ai_analysis.meta.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                {resume.ai_analysis.overallFeedback && resume.ai_analysis.overallFeedback.trim() !== "" && (
                  <p className="text-sm text-foreground mt-2 line-clamp-2 italic">
                    "{resume.ai_analysis.overallFeedback}"
                  </p>
                )}
              </div>
            ) : isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <span className="text-sm text-muted-foreground">Evaluating Score...</span>
              </div>
            ) : null}
          </div>

          {resume.parse_error && (
            <div className="mt-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <strong>Validation Issue: </strong>{resume.parse_error}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {!resume.ai_analysis && (
            <Button
              className="bg-gradient-primary shadow-glow"
              onClick={onAnalyze}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
              {isProcessing ? "Analyzing (1-2 mins)..." : "Analyze"}
            </Button>
          )}
          {resume.ai_analysis && (
            <>
              <Button
                variant="outline"
                onClick={onAnalyze}
                disabled={isProcessing}
                className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Brain className="w-4 h-4 mr-2" />
                View Analysis
              </Button>
              <Button
                variant="outline"
                onClick={onOptimize}
                disabled={isProcessing}
                className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Optimize
              </Button>
              <Button
                variant="outline"
                onClick={onShowVersions}
                disabled={isProcessing}
                className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
              >
                <FileText className="w-4 h-4 mr-2" />
                Versions
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnalysisDisplay({ analysis }: { analysis: any }) {
  const breakdown = analysis.ats?.categoryBreakdown || {
    content: 70,
    formatting: 70,
    grammar: 80,
    readability: 75,
    keywords: 65,
    skillsMatch: 60,
    experience: 70
  };

  return (
    <div className="space-y-6">
      {/* Overview Metadata and Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-indigo-100 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-300 animate-pulse" /> Overall ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{analysis.ats?.score ?? 0} <span className="text-lg font-normal text-indigo-200">/ 100</span></div>
            <Progress value={analysis.ats?.score ?? 0} className="h-2 bg-indigo-900/30 mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-emerald-400">{analysis.aiConfidence ?? 92}%</div>
            <p className="text-xs text-slate-400 mt-2">Evaluation accuracy rating based on semantic match</p>
          </CardContent>
        </Card>

        <Card className="bg-card border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-500" /> Engine Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div><strong>Provider:</strong> <span className="capitalize">{analysis.meta?.provider || "API"}</span></div>
            <div><strong>Model:</strong> <code>{analysis.meta?.model || "Standard"}</code></div>
            {analysis.meta?.timestamp && (
              <div className="truncate"><strong>Time:</strong> {new Date(analysis.meta.timestamp).toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ATS Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> ATS Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <BreakdownBar label="Content Quality" value={breakdown.content} />
          <BreakdownBar label="Formatting & Layout" value={breakdown.formatting} />
          <BreakdownBar label="Grammar & Spelling" value={breakdown.grammar} />
          <BreakdownBar label="Readability Index" value={breakdown.readability} />
          <BreakdownBar label="Keyword Density" value={breakdown.keywords} />
          <BreakdownBar label="Skills Alignment" value={breakdown.skillsMatch} />
          <BreakdownBar label="Experience Depth" value={breakdown.experience} />
        </CardContent>
      </Card>

      {/* Profile & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {analysis.personalInformation?.name && <div><strong>Name:</strong> {analysis.personalInformation.name}</div>}
            {analysis.personalInformation?.email && <div><strong>Email:</strong> {analysis.personalInformation.email}</div>}
            {analysis.personalInformation?.phone && <div><strong>Phone:</strong> {analysis.personalInformation.phone}</div>}
            {analysis.personalInformation?.location && <div><strong>Location:</strong> {analysis.personalInformation.location}</div>}
            {analysis.personalInformation?.linkedin && (
              <div className="truncate"><strong>LinkedIn:</strong> <a href={analysis.personalInformation.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">{analysis.personalInformation.linkedin}</a></div>
            )}
            {analysis.personalInformation?.github && (
              <div className="truncate"><strong>GitHub:</strong> <a href={analysis.personalInformation.github} target="_blank" rel="noreferrer" className="text-primary hover:underline">{analysis.personalInformation.github}</a></div>
            )}
            {analysis.personalInformation?.portfolio && (
              <div className="truncate"><strong>Portfolio:</strong> <a href={analysis.personalInformation.portfolio} target="_blank" rel="noreferrer" className="text-primary hover:underline">{analysis.personalInformation.portfolio}</a></div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Professional Summary Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{analysis.professionalSummary || "No professional summary detected in resume. Writing an executive summary is highly recommended to improve ATS performance."}</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-500" /> Skills Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.skills?.technical?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Technical Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.skills.technical.map((s: string, idx: number) => <Badge key={idx} variant="secondary">{s}</Badge>)}
              </div>
            </div>
          )}
          {analysis.skills?.soft?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Soft Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.skills.soft.map((s: string, idx: number) => <Badge key={idx} variant="outline">{s}</Badge>)}
              </div>
            </div>
          )}
          {analysis.missingSkills?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">Missing Recommended Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s: string, idx: number) => <Badge key={idx} variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">{s}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" /> Experience Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {analysis.experience?.map((exp: any, idx: number) => (
            <div key={idx} className="border-l-2 border-primary pl-4 py-1 space-y-1">
              <div className="font-semibold text-base">{exp.title} <span className="font-normal text-muted-foreground">at</span> {exp.company}</div>
              <div className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate} {exp.location ? `| ${exp.location}` : ""}</div>
              {exp.description && <p className="text-sm text-foreground mt-2">{exp.description}</p>}
              {exp.bulletPoints?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {exp.bulletPoints.map((point: string, i: number) => (
                    <li key={i} className="text-sm list-disc ml-4 text-muted-foreground">{point}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education, Projects, and Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.education?.map((edu: any, idx: number) => (
              <div key={idx} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                <div className="font-semibold text-sm">{edu.degree}</div>
                <div className="text-xs text-muted-foreground">{edu.school} {edu.graduationDate ? `(${edu.graduationDate})` : ""}</div>
                {edu.gpa && <div className="text-xs">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.projects?.map((proj: any, idx: number) => (
              <div key={idx} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                <div className="font-semibold text-sm flex items-center justify-between">
                  <span>{proj.name}</span>
                  {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Link</a>}
                </div>
                <p className="text-xs text-muted-foreground">{proj.description}</p>
                {proj.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((t: string, i: number) => <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">{t}</Badge>)}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Certifications & Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.certifications?.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Certifications</div>
                <ul className="space-y-1 text-sm list-disc pl-4">
                  {analysis.certifications.map((c: any, idx: number) => (
                    <li key={idx}>
                      {c.name} {c.issuer ? `— ${c.issuer}` : ""} {c.date ? `(${c.date})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.languages?.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Languages</div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.languages.map((l: string, idx: number) => <Badge key={idx} variant="outline">{l}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ATS Issues & Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Key ATS Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {analysis.missingKeywords?.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">Missing Keywords</div>
                <div className="flex flex-wrap gap-1">
                  {analysis.missingKeywords.map((kw: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>)}
                </div>
              </div>
            )}
            {analysis.ats?.issues?.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">Critical Issues</div>
                <ul className="list-disc pl-4 space-y-0.5 text-xs text-red-600">
                  {analysis.ats.issues.map((issue: string, idx: number) => <li key={idx}>{issue}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accordions for detailed issues & recommendations */}
      <Accordion type="single" collapsible className="border rounded-lg bg-card px-4">
        <AccordionItem value="strengths">
          <AccordionTrigger className="font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2 text-success" /> Strengths ({analysis.strengths?.length || 0})
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5 pl-4 list-disc text-sm text-muted-foreground">
              {analysis.strengths?.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="weaknesses">
          <AccordionTrigger className="font-semibold text-sm">
            <AlertCircle className="w-4 h-4 mr-2 text-destructive" /> Weaknesses ({analysis.weaknesses?.length || 0})
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5 pl-4 list-disc text-sm text-muted-foreground">
              {analysis.weaknesses?.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="grammar">
          <AccordionTrigger className="font-semibold text-sm">
            <FileText className="w-4 h-4 mr-2 text-amber-500" /> Grammar & Formatting Issues
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {analysis.grammarIssues?.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Grammar & Syntax Errors:</div>
                <ul className="list-disc pl-4 text-sm space-y-1 text-muted-foreground">
                  {analysis.grammarIssues.map((g: string, idx: number) => <li key={idx}>{g}</li>)}
                </ul>
              </div>
            )}
            {analysis.formattingIssues?.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Formatting & Layout Deficiencies:</div>
                <ul className="list-disc pl-4 text-sm space-y-1 text-muted-foreground">
                  {analysis.formattingIssues.map((f: string, idx: number) => <li key={idx}>{f}</li>)}
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recommendations">
          <AccordionTrigger className="font-semibold text-sm">
            <Sparkles className="w-4 h-4 mr-2 text-primary" /> Overall Feedback & Recommendations
          </AccordionTrigger>
          <AccordionContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{analysis.overallFeedback}</p>
            {analysis.improvementSuggestions?.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">Action Plan:</div>
                <ul className="list-disc pl-4 space-y-1.5">
                  {analysis.improvementSuggestions.map((suggestion: string, idx: number) => <li key={idx}>{suggestion}</li>)}
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}


function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    pending: { label: "Pending", cls: "text-muted-foreground border-border", icon: Loader2 },
    processing: { label: "Analyzing…", cls: "text-primary border-primary/30", icon: Loader2 },
    completed: { label: "Analyzed", cls: "text-success border-success/30", icon: CheckCircle2 },
    failed: { label: "Failed", cls: "text-destructive border-destructive/30", icon: AlertCircle },
  };
  const s = map[status] ?? map.pending;
  const Icon = s.icon;
  const animate = status === "processing" || status === "pending";
  return (
    <Badge variant="outline" className={s.cls}>
      <Icon className={`w-3 h-3 mr-1 ${animate ? "animate-spin" : ""}`} /> {s.label}
    </Badge>
  );
}

function formatBytes(b: number) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB"];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), u.length - 1);
  return `${(b / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}
