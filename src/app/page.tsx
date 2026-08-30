export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <main className="flex flex-col items-center gap-8 z-10 text-center">
        <h1 className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Forensix
        </h1>
        <p className="text-xl max-w-2xl text-slate-300">
          A clean architecture boilerplate to build your advanced application.
        </p>
        
        <div className="flex gap-4 mt-8">
          <button className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors font-medium text-white cursor-pointer">
            Get Started
          </button>
          <button className="px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors font-medium text-white cursor-pointer">
            Documentation
          </button>
        </div>
      </main>
    </div>
  );
}
