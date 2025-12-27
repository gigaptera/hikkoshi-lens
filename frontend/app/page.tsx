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
      <section className="flex-1 flex flex-col items-center justify-center px-6 pb-32 w-full max-w-screen-xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h1 className="font-display text-[8vw] leading-[1.1] tracking-tight text-foreground">
            理想の街と
            <br />
            <span className="">出会う</span>
          </h1>
          <p className="font-sans text-xl text-muted-foreground tracking-wide">
            Data-driven relocation intelligence.
          </p>
        </div>

        <div className="w-full">
          <SearchWidget />
        </div>
      </section>

      {/* Subtle Footer */}
      <footer className="py-6 text-center text-xs font-mono text-muted-foreground/50 border-t border-black/5 mx-6">
        © 2025 HIKKOSHI LENS. MUSEUM ARCHITECTURE.
      </footer>
    </main>
  );
}
