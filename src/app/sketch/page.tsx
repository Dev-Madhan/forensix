import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SketchStudioWorkbench } from "@/components/sketch/sketch-studio-workbench";

export const metadata: Metadata = {
  title: "Sketch Generator | Forensix",
  description: "AI Forensic Composite Sketch Generator",
};

export const dynamic = "force-dynamic";

export default function SketchPage() {
  return (
    <main className="flex-1 min-h-[calc(100dvh-4rem)] flex flex-col bg-background text-foreground">
      <Suspense
        fallback={
          <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#070709] text-foreground">
            <Loader2 className="size-6 text-[#8579ff] animate-spin" />
            <span className="text-xs font-mono text-zinc-400">Loading Forensic Sketch Studio...</span>
          </div>
        }
      >
        <SketchStudioWorkbench />
      </Suspense>
    </main>
  );
}


