import { Hero } from "@/components/flx/blocks/hero/hero-09/hero-09";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero
        title="When every detail matters."
        titleLine2="Turn memory into evidence."
        description="Forensix transforms eyewitness descriptions into AI-generated composite sketches, potential facial matches, and actionable case intelligence."
        searchPlaceholder="Describe a suspect..."
        searchButtonText="Investigate"
        heroImage="/images/hero-image.png"
        heroAlt="Forensix Hero Image"
        bottomTitle="From memory"
        bottomTitleLine2="to identification."
        bottomText="Reconstruct what witnesses remember, discover potential matches with AI-powered facial recognition, and bring critical case intelligence together in one investigative workspace."
        mobileBottomText="AI-powered sketches, facial matches, and case intelligence — all in one workspace."
      />
    </main>
  );
}
