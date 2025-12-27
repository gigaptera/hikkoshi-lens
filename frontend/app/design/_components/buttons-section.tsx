import { Button } from "@/components/ui/button";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { DesignSectionWrapper } from "./design-section-wrapper";

export function ButtonsDesignSection() {
  return (
    <DesignSectionWrapper title="Buttons">
      <div className="flex flex-wrap gap-4 mb-4">
        <Button>Default (Primary)</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg">Large Button</Button>
        <Button>Default Button</Button>
        <Button size="sm">Small Button</Button>
        <Button size="icon">
          <MagnifyingGlass weight="bold" />
        </Button>
      </div>
    </DesignSectionWrapper>
  );
}
