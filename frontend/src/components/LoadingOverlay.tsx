import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  if (!message) return null; // render nothing if no message (should be controlled by parent)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-primary/90">
          {message}
        </p>
      </div>
    </div>
  );
}
