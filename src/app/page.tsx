import { Hero } from "@/components/flx/blocks/hero/hero-09/hero";
import { Feature02 } from "@/components/flx/blocks/feature/feature-02/feature";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero
        title="When every detail matters."
        titleLine2="Turn memory into evidence."
        description="Forensix transforms eyewitness descriptions into AI-generated composite sketches, potential facial matches, and actionable case intelligence."
        mobileDescription="AI-generated sketches, facial matches, and case intelligence from witness memory."
        searchPlaceholder="Describe a suspect..."
        searchButtonText="Investigate"
        heroImage="/images/hero-image.png"
        heroAlt="Forensix Hero Image"
        bottomTitle=""
      />

      <Feature02
        title="Uncover the Truth, Efficiently."
        description="Forensix provides an intuitive, powerful suite of tools designed to accelerate investigations and generate accurate leads from initial witness statements to final case reports."
        image="/images/feature-image.png"
        imageAlt="Forensix Dashboard showing AI Facial Recognition and Composite Sketching"
        animation="subtle"
        steps={[
          {
            number: '01',
            title: 'Analyze Descriptions',
            description: 'Input detailed witness statements to extract key facial and contextual features instantly.',
          },
          {
            number: '02',
            title: 'AI Generation',
            description: 'Instantly generate hyper-realistic composite sketches based on the extracted data.',
          },
          {
            number: '03',
            title: 'Facial Matching',
            description: 'Cross-reference generated sketches with known criminal databases for potential matches.',
          },
          {
            number: '04',
            title: 'Case Intelligence',
            description: 'Compile findings into comprehensive, actionable reports for your entire investigative team.',
          },
        ]}
      />
    </main>
  );
}
