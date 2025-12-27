import { SearchWidget } from "@/components/features/search/search-widget";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background selection:bg-black selection:text-white">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="flex flex-col items-start pt-20 pb-16 w-full max-w-5xl mx-auto space-y-10 px-6 sm:px-8 lg:px-12">
        <div className="space-y-5 text-left w-full">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground">
            理想の街と
            <br />
            <span className="text-foreground/80">出会う</span>
          </h1>
          <p className="font-sans text-base md:text-lg text-muted-foreground tracking-wide pl-1 border-l-2 border-primary/20">
            Data-driven relocation intelligence.
          </p>
        </div>

        <div className="w-full">
          <SearchWidget />
        </div>
      </section>

      {/* Future Sections Placeholder */}
      <section className="w-full max-w-screen-xl mx-auto px-6 py-12">
        {/* Content will be added here in future steps */}
      </section>

      {/* Subtle Footer */}
      <footer className="py-6 text-center text-xs font-mono text-muted-foreground/50 border-t border-black/5 mx-6">
        © 2025 HIKKOSHI LENS. MUSEUM ARCHITECTURE.
      </footer>
    </main>
  );
}
