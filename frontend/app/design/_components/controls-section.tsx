import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { DesignSectionWrapper } from "./design-section-wrapper";

export function ControlsDesignSection() {
  return (
    <DesignSectionWrapper title="Controls & Inputs">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Inputs & Textarea */}
        <div className="space-y-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="Email" />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="bio">Bio (Textarea)</Label>
            <Textarea placeholder="Type your message involved here." id="bio" />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Framework (Select)</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Frameworks</SelectLabel>
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column: Switch, Checkbox, Slider, Radio */}
        <div className="space-y-8">
          <div className="space-y-3">
            <Label>Radio Group</Label>
            <RadioGroup defaultValue="option-one">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Option One</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Option Two</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Interactive</Label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="mode-2" />
                <Label htmlFor="mode-2">Switch</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="terms-2" />
                <Label htmlFor="terms-2">Checkbox</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Slider</Label>
            <Slider
              defaultValue={[50]}
              max={100}
              step={1}
              className="w-[80%]"
            />
          </div>
        </div>
      </div>
    </DesignSectionWrapper>
  );
}
