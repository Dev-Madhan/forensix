import { Metadata } from "next";
import { getStudioInitialData } from "@/features/sketches/actions";
import { ForensicSketchStudio } from "@/components/sketch/forensic-sketch-studio";

export const metadata: Metadata = {
  title: "Forensic Sketch Studio | Criminal Eye",
  description:
    "Interactive AI forensic composite sketch generation with witness NLP tokenization, ControlNet lineart conditioning, and biometric suspect recognition.",
};
export const dynamic = "force-dynamic";

export default async function SketchPage() {
  const { cases, criminals } = await getStudioInitialData();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground">
      <ForensicSketchStudio initialCases={cases} initialCriminals={criminals} />
    </div>
  );
}
