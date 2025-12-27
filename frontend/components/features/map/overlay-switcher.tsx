import { Button } from "@/components/ui/button";
import { Shield, ShoppingCart, Tree } from "@phosphor-icons/react";

export function OverlaySwitcherMock() {
  return (
    <div className="flex flex-col gap-2 p-4 bg-background/80 backdrop-blur-md border w-fit shadow-lg z-50">
      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
        Map Layers
      </span>

      <Button
        variant="outline"
        size="sm"
        className="justify-start gap-2 h-9 w-40 bg-background/50 border-input/50 hover:bg-white hover:text-black transition-colors rounded-none"
      >
        <Shield className="h-3 w-3" />
        <span className="font-sans">Safety Heatmap</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-2 h-9 w-40 text-muted-foreground hover:text-foreground rounded-none"
      >
        <ShoppingCart className="h-3 w-3" />
        <span className="font-sans">Supermarkets</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-2 h-9 w-40 text-muted-foreground hover:text-foreground rounded-none"
      >
        <Tree className="h-3 w-3" />
        <span className="font-sans">Parks & Nature</span>
      </Button>
    </div>
  );
}
