export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <main className="flex flex-col items-center gap-8 z-10 text-center">
        <h1 className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">
          Forensix
        </h1>
        <p className="text-xl max-w-2xl text-muted-foreground">
          A clean architecture boilerplate to build your advanced application.
        </p>
        
        <div className="flex gap-4 mt-8">
          <button className="px-6 py-3 rounded-full bg-primary hover:opacity-90 transition-opacity font-medium text-primary-foreground cursor-pointer">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium text-secondary-foreground cursor-pointer">
            Documentation
          </button>
        </div>
      </main>
    </div>
  );
}
