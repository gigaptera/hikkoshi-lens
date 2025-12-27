import { Button } from "@/components/ui/button";
import { SearchWidget } from "@/components/features/search/search-widget";
import { ModeToggle } from "@/components/mode-toggle";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background selection:bg-black selection:text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 bg-black dark:bg-white rounded-none"></span>
          <span className="font-display font-medium text-xl tracking-tight">
            Hikkoshi Lens
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button
            variant="outline"
            className="rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            LOGIN
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="flex flex-col items-center pt-16 pb-12 w-full max-w-screen-xl mx-auto text-center space-y-8 px-6">
        <div className="space-y-4">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground">
            理想の街と
            <br />
            <span className="">出会う</span>
          </h1>
          <p className="font-sans text-base md:text-lg text-muted-foreground tracking-wide">
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
