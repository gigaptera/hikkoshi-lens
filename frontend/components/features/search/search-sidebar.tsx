"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CurrencyJpy,
  Briefcase,
  Faders,
  ShieldCheck,
  Train,
  Storefront,
  Warning,
  MapPinLine,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function SearchSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Basic Filter States
  const [maxRent, setMaxRent] = useState(searchParams.get("max_rent") || "");
  const [buildingType, setBuildingType] = useState(
    searchParams.get("building_type") || "mansion"
  );
  const [layout, setLayout] = useState(
    searchParams.get("layout") || "1r_1k_1dk"
  );

  // Housing Allowance
  const [useAllowance, setUseAllowance] = useState(
    searchParams.get("subsidy_type") === "from_workplace"
  );
  const [allowanceAmount, setAllowanceAmount] = useState(""); // Not yet represented in URL logic?
  const [allowanceType, setAllowanceType] = useState("distance");
  const [allowanceValue, setAllowanceValue] = useState("");

  // Weights (0-100)
  const [weights, setWeights] = useState({
    rent: parseInt(searchParams.get("w_rent") || "50"),
    access: parseInt(searchParams.get("w_access") || "50"),
    safety: parseInt(searchParams.get("w_safety") || "50"),
    surroundings: parseInt(searchParams.get("w_surroundings") || "50"),
    disaster: parseInt(searchParams.get("w_disaster") || "50"),
  });

  // Debounced URL Update
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (maxRent) params.set("max_rent", maxRent);
      else params.delete("max_rent");

      if (buildingType) params.set("building_type", buildingType);
      if (layout) params.set("layout", layout);

      if (useAllowance) {
        params.set("subsidy_type", "from_workplace");
        // Add ranges if needed
      } else {
        params.delete("subsidy_type");
      }

      // Weights
      params.set("w_rent", weights.rent.toString());
      params.set("w_access", weights.access.toString());
      params.set("w_safety", weights.safety.toString());
      params.set("w_surroundings", weights.surroundings.toString());
      params.set("w_disaster", weights.disaster.toString());

      const newInfo = params.toString();
      const currentInfo = searchParams.toString();

      if (newInfo !== currentInfo) {
        router.replace(`${pathname}?${newInfo}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    maxRent,
    buildingType,
    layout,
    useAllowance,
    weights,
    router,
    pathname,
    searchParams,
  ]);

  const updateWeight = (key: keyof typeof weights, value: number[]) => {
    setWeights((prev) => ({ ...prev, [key]: value[0] }));
  };

  return (
    <div className="w-full max-w-xs">
      <Accordion
        type="multiple"
        defaultValue={["basic", "allowance", "priorities"]}
        className="w-full"
      >
        {/* Basic Conditions */}
        <AccordionItem value="basic" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3 px-1">
            <div className="flex items-center gap-2">
              <MapPinLine className="text-primary" size={20} />
              <span className="font-display text-base tracking-wide">
                基本条件
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-6">
            <div className="space-y-4">
              {/* Rent Cap */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  家賃上限
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="上限なし"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    className="h-10 text-base pr-8 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <CurrencyJpy
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                </div>
              </div>

              {/* Building Type */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  建物種別
                </Label>
                <Select value={buildingType} onValueChange={setBuildingType}>
                  <SelectTrigger className="h-10 text-base rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mansion">マンション</SelectItem>
                    <SelectItem value="apart">アパート</SelectItem>
                    <SelectItem value="detached">一戸建て</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layout */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  間取り
                </Label>
                <Select value={layout} onValueChange={setLayout}>
                  <SelectTrigger className="h-10 text-base rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1r_1k_1dk">1R-1DK</SelectItem>
                    <SelectItem value="1ldk_2k_2dk">1LDK-2DK</SelectItem>
                    <SelectItem value="2ldk_3k_3dk">2LDK-3DK</SelectItem>
                    <SelectItem value="3ldk_4k">3LDK-4K</SelectItem>
                    <SelectItem value="4ldk">4LDK〜</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* ... Rest of the component ... */}

        <div className="h-px bg-border/50 w-full my-2" />

        {/* Housing Allowance */}
        <AccordionItem value="allowance" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3 px-1">
            <div className="flex items-center gap-2">
              <Briefcase className="text-primary" size={20} />
              <span className="font-display text-base tracking-wide">
                家賃補助・福利厚生
              </span>
            </div>
            {/* Switch is outside trigger for direct interaction, but complicates accordion structure. 
                Ideally, the switch should be strictly separate or part of the header. 
                For now, placing it inside the trigger might cause event bubbling issues, 
                so I'll keep the switch inside the content or redesign.
                User asked for accordion. I'll put the Switch inside the content area for now, 
                or just keep the title as trigger. 
                Let's put the switch IN the header but stop propagation? 
                Actually, let's put the Switch in the content area for simplicity, 
                OR keep the header complex. 
                For simpler UX, let's just make the whole section collapsible.
             */}
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">
                  制度を利用する
                </Label>
                <Switch
                  checked={useAllowance}
                  onCheckedChange={setUseAllowance}
                />
              </div>

              <div
                className={cn(
                  "space-y-4 transition-all duration-200",
                  useAllowance
                    ? "opacity-100"
                    : "opacity-30 pointer-events-none grayscale"
                )}
              >
                <RadioGroup
                  value={allowanceType}
                  onValueChange={setAllowanceType}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="distance" id="sidebar-distance" />
                    <Label
                      htmlFor="sidebar-distance"
                      className="cursor-pointer font-normal"
                    >
                      会社から近い (km)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stations" id="sidebar-stations" />
                    <Label
                      htmlFor="sidebar-stations"
                      className="cursor-pointer font-normal"
                    >
                      駅数が近い
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm shrink-0 w-10 text-muted-foreground">
                      条件:
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="3.0"
                        value={allowanceValue}
                        onChange={(e) => setAllowanceValue(e.target.value)}
                        className="h-9 w-20 rounded-none font-mono bg-background text-center px-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {allowanceType === "distance" ? "km 以内" : "駅 以内"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label className="text-sm shrink-0 w-10 text-muted-foreground">
                      金額:
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="3.0"
                        value={allowanceAmount}
                        onChange={(e) => setAllowanceAmount(e.target.value)}
                        className="h-9 w-20 rounded-none font-mono bg-background text-center px-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        万円 支給
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/50 w-full my-2" />

        {/* Priorities */}
        <AccordionItem value="priorities" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3 px-1">
            <div className="flex items-center gap-2">
              <Faders className="text-primary" size={20} />
              <span className="font-display text-base tracking-wide">
                重視するポイント
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-6">
            <div className="space-y-6 pt-2">
              {/* Price */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CurrencyJpy size={16} />
                    <span>物価 (安さ)</span>
                  </div>
                  <span className="font-mono font-bold">{weights.rent}</span>
                </div>
                <Slider
                  value={[weights.rent]}
                  max={100}
                  step={10}
                  onValueChange={(val) => updateWeight("rent", val)}
                />
              </div>

              {/* Safety */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck size={16} />
                    <span>治安 (安全性)</span>
                  </div>
                  <span className="font-mono font-bold">{weights.safety}</span>
                </div>
                <Slider
                  value={[weights.safety]}
                  max={100}
                  step={10}
                  onValueChange={(val) => updateWeight("safety", val)}
                />
              </div>

              {/* Access */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Train size={16} />
                    <span>アクセス (通勤時間)</span>
                  </div>
                  <span className="font-mono font-bold">{weights.access}</span>
                </div>
                <Slider
                  value={[weights.access]}
                  max={100}
                  step={10}
                  onValueChange={(val) => updateWeight("access", val)}
                />
              </div>

              {/* Surroundings */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Storefront size={16} />
                    <span>周辺施設 (充実度)</span>
                  </div>
                  <span className="font-mono font-bold">
                    {weights.surroundings}
                  </span>
                </div>
                <Slider
                  value={[weights.surroundings]}
                  max={100}
                  step={10}
                  onValueChange={(val) => updateWeight("surroundings", val)}
                />
              </div>

              {/* Disaster */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Warning size={16} />
                    <span>防災 (安全性)</span>
                  </div>
                  <span className="font-mono font-bold">
                    {weights.disaster}
                  </span>
                </div>
                <Slider
                  value={[weights.disaster]}
                  max={100}
                  step={10}
                  onValueChange={(val) => updateWeight("disaster", val)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
