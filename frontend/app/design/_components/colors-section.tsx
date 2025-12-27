import { DesignSectionWrapper } from "./design-section-wrapper";

export function ColorsDesignSection() {
  return (
    <DesignSectionWrapper title="Colors (OKLCH)">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Primary */}
        <div className="space-y-2">
          <div className="h-20 rounded-xl bg-primary shadow-sm flex items-center justify-center text-primary-foreground font-bold">
            Primary
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            --primary
          </div>
        </div>
        {/* Secondary */}
        <div className="space-y-2">
          <div className="h-20 rounded-xl bg-secondary shadow-sm flex items-center justify-center text-secondary-foreground font-bold">
            Secondary
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            --secondary
          </div>
        </div>
        {/* Destructive */}
        <div className="space-y-2">
          <div className="h-20 rounded-xl bg-destructive shadow-sm flex items-center justify-center text-destructive-foreground font-bold">
            Destructive
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            --destructive
          </div>
        </div>
        {/* Muted */}
        <div className="space-y-2">
          <div className="h-20 rounded-xl bg-muted shadow-sm flex items-center justify-center text-muted-foreground font-bold">
            Muted
          </div>
          <div className="text-xs font-mono text-muted-foreground">--muted</div>
        </div>
      </div>
    </DesignSectionWrapper>
  );
}
