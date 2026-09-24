import { Metadata } from "next";
import { SketchStudioWorkbench } from "@/components/sketch/sketch-studio-workbench";

export const metadata: Metadata = {
  title: "Sketch Generator | Forensix",
  description: "AI Forensic Composite Sketch Generator",
};

export const dynamic = "force-dynamic";

export default function SketchPage() {
  return (
    <main className="flex-1 min-h-[calc(100dvh-4rem)] flex flex-col bg-background text-foreground">
      <SketchStudioWorkbench />
    </main>
  );
}

