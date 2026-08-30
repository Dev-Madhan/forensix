export default function CasesPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center p-8 text-center bg-background text-foreground">
      <div className="max-w-2xl flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono text-muted-foreground">
          <span>/cases</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-heading">
          Case Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Centralized hub to create, update, and track ongoing investigation records, witness statements, and evidentiary findings.
        </p>
      </div>
    </div>
  );
}
