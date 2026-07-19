import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Brain, FileText, Target, Layers, ArrowRight, ShieldCheck, Zap, Database, GitMerge
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Reveal, RevealStagger, RevealItem } from "@/components/animations/Reveal";
import { PlexusBackground } from "@/components/landing/PlexusBackground";

export const Route = createFileRoute("/")({ component: Landing });

const CAPABILITIES = [
  { icon: FileText, title: "Precision Parsing", desc: "Extract structured data from unstructured PDF and DOCX files with high fidelity, mapping raw text to deterministic data models." },
  { icon: Target, title: "Deterministic ATS Scoring", desc: "Strict rubric-based evaluation system that mathematically calculates resume compatibility and gap analysis." },
  { icon: Brain, title: "AI-Powered Optimization", desc: "Leverages Gemini, Groq, or Grok to rewrite bullet points, strengthen action verbs, and ensure ATS keyword density." },
  { icon: Layers, title: "Multi-Format Export", desc: "Programmatically generate production-ready PDF and DOCX binaries using dynamic formatting engines." },
  { icon: Database, title: "Kanban Job Tracker", desc: "Integrated CRM for managing the entire application lifecycle, from initial outreach to final offer negotiation." },
  { icon: ShieldCheck, title: "Data Integrity", desc: "Built-in validation pipelines prevent AI hallucinations, ensuring original facts and figures remain completely unaltered." },
];

const WORKFLOW = [
  { step: "01", title: "Ingestion", desc: "Securely upload raw PDF or DOCX files. The backend extracts, cleans, and normalizes text while maintaining layout context." },
  { step: "02", title: "Analysis", desc: "The AI engine evaluates the document against a strict ATS schema, scoring it on content, formatting, grammar, and skills." },
  { step: "03", title: "Enhancement", desc: "User provides missing context via targeted prompts. The system structurally optimizes the resume without fabricating data." },
  { step: "04", title: "Deployment", desc: "The optimized data model is compiled into ATS-compliant PDF and DOCX binaries, ready for immediate submission." },
];

function Landing() {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-40">
        <PlexusBackground />
      </div>

      {/* Scroll Progress */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary origin-left z-50"
        style={{ scaleX: progress }}
      />

      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-primary grid place-items-center">
              <GitMerge className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">CareerForge System</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm text-muted-foreground font-medium">
            <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Architecture</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" className="font-medium"><Link to="/dashboard">Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="font-medium hidden sm:flex"><Link to="/login">Sign In</Link></Button>
                <Button asChild size="sm" className="font-medium"><Link to="/signup">Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-mono text-muted-foreground mb-8"
        >
          <Zap className="w-3.5 h-3.5 text-primary" /> System Status: Online v2.1.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-tight md:leading-tight"
        >
          Enterprise-Grade Resume <span className="text-primary">Intelligence.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          Advanced document parsing, deterministic ATS evaluation, and AI-driven structural optimization. 
          Built for precision, engineered for scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
            <Link to={user ? "/dashboard" : "/signup"}>Deploy Now <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
            <a href="#capabilities">View Technical Specs</a>
          </Button>
        </motion.div>
      </section>

      {/* Interface Mockup Segment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 md:pb-32">
        <div className="flex justify-center mb-16">
           <img 
             src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
             alt="AI Resume Analysis Dashboard" 
             className="w-full max-w-5xl rounded-2xl shadow-2xl border border-border opacity-90 hover:opacity-100 transition-opacity"
           />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 md:p-8 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center border-b border-border pb-4 mb-6 gap-2">
            <div className="flex gap-1.5 mr-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60"></div>
              <div className="w-3 h-3 rounded-full bg-warning/60"></div>
              <div className="w-3 h-3 rounded-full bg-success/60"></div>
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-md overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-none">
              ~/careerforge/analysis-engine
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg bg-background border border-border p-5">
              <div className="text-xs font-mono uppercase text-muted-foreground mb-3 tracking-wider">Engine Output</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lexical Analysis</span>
                  <span className="text-sm font-mono text-success">Passed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Keyword Density</span>
                  <span className="text-sm font-mono text-warning">Suboptimal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Grammar Check</span>
                  <span className="text-sm font-mono text-success">Passed</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 rounded-lg bg-background border border-border p-5 flex flex-col justify-center">
              <div className="text-xs font-mono uppercase text-muted-foreground mb-3 tracking-wider">Computed ATS Score</div>
              <div className="flex items-end gap-4">
                <div className="text-5xl font-bold tracking-tighter">84</div>
                <div className="text-sm text-muted-foreground mb-2">/ 100 max points</div>
              </div>
              <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[84%] rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <Reveal className="mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Core Capabilities</h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
              Engineered to process, evaluate, and structurally enhance professional documents using deterministic algorithms and large language models.
            </p>
          </Reveal>
          
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.05}>
            {CAPABILITIES.map((cap) => (
              <RevealItem key={cap.title}>
                <div className="h-full rounded-xl border border-border bg-card p-6 md:p-8 hover:border-primary/50 transition-colors shadow-sm">
                  <cap.icon className="w-6 h-6 text-primary mb-5" />
                  <h3 className="font-semibold text-lg mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <Reveal className="mb-12 md:mb-16 md:text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">System Architecture</h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A logical pipeline designed for secure, rapid, and precise document transformation.
          </p>
        </Reveal>
        
        <div className="mb-16 flex justify-center">
           <img 
             src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" 
             alt="Data Processing Architecture" 
             className="w-full max-w-5xl rounded-2xl shadow-2xl border border-border opacity-90 hover:opacity-100 transition-opacity"
           />
        </div>

        <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" stagger={0.1}>
          {WORKFLOW.map((step) => (
            <RevealItem key={step.step}>
              <div className="relative">
                <div className="text-4xl font-mono font-bold text-primary/20 mb-4">{step.step}</div>
                <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-background">
        <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Ready to initialize?</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Deploy the CareerForge AI analysis engine for your career today. Secure, private, and highly accurate.
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
              <Link to={user ? "/dashboard" : "/signup"}>Start System <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm font-mono text-muted-foreground bg-muted/30">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
          <span>© {new Date().getFullYear()} CareerForge Systems.</span>
          <span className="hidden md:inline">|</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success animate-pulse" /> All operations normal.</span>
        </div>
      </footer>
    </div>
  );
}
