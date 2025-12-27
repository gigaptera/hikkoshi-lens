"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { StationCard } from "@/components/features/station/station-card";
import { SearchWidget } from "@/components/features/search/search-widget";
import { OverlaySwitcherMock } from "@/components/features/map/overlay-switcher";

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-background p-12 space-y-20 font-sans">
      <header className="space-y-4">
        <h1 className="font-display text-5xl font-medium tracking-tight">
          Design System
        </h1>
        <p className="text-muted-foreground font-sans text-xl">
          Code Name:{" "}
          <span className="font-mono text-foreground">Modern Museum</span>
        </p>
      </header>

      {/* Typography */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl border-b pb-2">01. Typography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="font-display text-6xl">Display Serif</p>
            <p className="text-sm font-mono text-muted-foreground">
              Playfair Display / Headings
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-sans text-4xl">Sans Body</p>
            <p className="text-sm font-mono text-muted-foreground">
              Inter / UI Text
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-mono text-2xl">Monospace Data</p>
            <p className="text-sm font-mono text-muted-foreground">
              JetBrains Mono / Numbers, Labels
            </p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl border-b pb-2">02. Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="default">Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large Action</Button>
        </div>
      </section>

      {/* Inputs & Forms */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl border-b pb-2">03. Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-label">Text Input</label>
            <Input placeholder="Enter value..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-label">Select Box</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opt1">Option One</SelectItem>
                <SelectItem value="opt2">Option Two</SelectItem>
                <SelectItem value="opt3">Option Three</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-label">Slider</label>
            <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl border-b pb-2">04. Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Example Card</CardTitle>
              <CardDescription>Description text goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-secondary/20 flex items-center justify-center font-mono text-xs">
                Content Area
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Action
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-primary-foreground">
                Dark Card
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Inverted aesthetic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">High contrast variant for emphasis.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feedback & Overlay */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl border-b pb-2">
          05. Feedback & Overlays
        </h2>
        <div className="flex gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        <div className="flex flex-wrap gap-8 pt-4">
          {/* Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Modal Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Museum Dialog</DialogTitle>
                <DialogDescription>
                  This is a sharp, 0px radius dialog window.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm font-sans">
                  The quick brown fox jumps over the lazy dog. Note the sharp
                  edges and clean typography.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Adjust your search preferences here.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-20 w-full" />
              </div>
            </SheetContent>
          </Sheet>

          {/* Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium font-display leading-none">
                    Dimensions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Set the dimensions for the layer.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* Feature Components */}
      <section className="space-y-8 pb-20">
        <h2 className="font-display text-2xl border-b pb-2">
          06. Feature Components
        </h2>
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
              Search Widget (Refined)
            </h3>
            {/* Light Background Check */}
            <div className="p-12 bg-gray-50 border">
              <p className="text-xs font-mono text-muted-foreground mb-4">
                On Light Background
              </p>
              <SearchWidget />
            </div>
            {/* Dark Background Check */}
            <div className="p-12 bg-neutral-900 border">
              <p className="text-xs font-mono text-white/50 mb-4">
                On Dark Background
              </p>
              <SearchWidget />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
              Station Card
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              <StationCard />
              <StationCard />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
              Map Overlay Switcher
            </h3>
            <div className="h-64 bg-muted relative border">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono">
                Map View Placeholder
              </div>
              <div className="absolute top-4 left-4">
                <OverlaySwitcherMock />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
