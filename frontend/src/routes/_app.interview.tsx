import { createFileRoute } from "@tanstack/react-router";
import { Brain, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/interview")({
  component: ComingSoonPage,
});

function ComingSoonPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 md:p-10">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow grid place-items-center">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            This feature is currently under development.
            More AI-powered interview preparation tools and improvements will be available in future updates.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span>AI-Powered Prep Coach</span>
        </div>
      </div>
    </div>
  );
}
