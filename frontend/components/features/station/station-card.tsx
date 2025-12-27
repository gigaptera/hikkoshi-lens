import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ShieldCheck, MapPin } from "lucide-react";

export function StationCard() {
  return (
    <Card className="w-[300px] group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      {/* Image Placeholder area */}
      <div className="relative h-48 bg-muted w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        {/* Mock Image Gradient */}
        <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-400" />

        {/* Score Overlay */}
        <div className="absolute bottom-4 right-4 z-20 text-white text-right">
          <span className="block text-xs font-mono opacity-80 uppercase tracking-widest">
            Match Score
          </span>
          <span className="font-display text-6xl leading-none">92</span>
        </div>

        {/* Line Badge */}
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-white/90 text-black hover:bg-white rounded-none border-0 font-mono">
            JR 山手線
          </Badge>
        </div>
      </div>

      <CardHeader className="pt-5 pb-2">
        <div className="flex justify-between items-baseline">
          <CardTitle className="text-2xl">Ebisu</CardTitle>
          <span className="font-mono text-sm text-muted-foreground">
            Stop #3
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm font-sans pt-1">
          <MapPin className="h-3 w-3" />
          <span>15 min to Shibuya</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Building2 className="h-3 w-3" /> Rent
            </div>
            <p className="font-mono text-lg">¥12.5M</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" /> Safety
            </div>
            <p className="font-mono text-lg">A+</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
