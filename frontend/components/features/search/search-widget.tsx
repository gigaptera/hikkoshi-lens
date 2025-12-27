"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MapPinLine,
  Spinner,
  MagnifyingGlass,
  CurrencyJpy,
  Briefcase,
  Faders,
  ShieldCheck,
  Train,
  Storefront,
  Warning,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { searchAddress } from "@/lib/services/geocoding";

export function SearchWidget() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [buildingType, setBuildingType] = useState("mansion");
  const [layout, setLayout] = useState("1r_1k_1dk");
  const [maxRent, setMaxRent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Housing Allowance
  const [useAllowance, setUseAllowance] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState("");
  const [allowanceType, setAllowanceType] = useState("distance"); // distance or stations
  const [allowanceValue, setAllowanceValue] = useState("");

  // Weights (0-100)
  const [weights, setWeights] = useState({
    rent: 50,
    access: 50,
    safety: 50,
    surroundings: 50,
    disaster: 50,
  });

  const handleSearch = async () => {
    if (!location.trim()) return;
    setIsLoading(true);

    try {
      // Use the robust geocoding service (GSI -> Mapbox)
      const data = await searchAddress(location);
      let lat = "";
      let lon = "";

      if (data.features && data.features.length > 0) {
        const [lng, ltt] = data.features[0].center;
        lat = ltt.toString();
        lon = lng.toString();
      }

      const params = new URLSearchParams();
      // If geocoding succeeded, use coordinates.
      // If not (or no token), we still pass 'q' but SearchResultPage might default to Tokyo.
      if (lat && lon) {
        params.set("lat", lat);
        params.set("lon", lon);
      }
      params.set("q", location);

      params.set("building_type", buildingType);
      params.set("layout", layout);
      if (maxRent) params.set("max_rent", maxRent);

      // Pass allowance params if enabled
      if (useAllowance) {
        if (allowanceAmount) params.set("allowance_amount", allowanceAmount);
        params.set("allowance_type", allowanceType);
        params.set("allowance_value", allowanceValue || "3.0");
      }

      params.set("w_rent", weights.rent.toString());
      params.set("w_access", weights.access.toString());
      params.set("w_safety", weights.safety.toString());
      params.set("w_surroundings", weights.surroundings.toString());
      params.set("w_disaster", weights.disaster.toString());

      router.push(`/search/result?${params.toString()}`);
    } catch (error) {
      console.error("Search failed:", error);
      // Fallback navigation even if geocoding fails
      const params = new URLSearchParams();
      params.set("q", location);
      router.push(`/search/result?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWeight = (key: keyof typeof weights, value: number[]) => {
    setWeights((prev) => ({ ...prev, [key]: value[0] }));
  };

  return (
    <div className="w-full max-w-4xl font-sans bg-background/95 backdrop-blur-sm border border-primary/10 shadow-2xl p-8 relative z-20 text-left">
      <div className="space-y-8">
        {/* Section 1: Location & Basic Constraints */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPinLine className="text-primary" size={24} />
            <h3 className="font-display text-lg tracking-wide">
              検索エリア・基本条件
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Location - Spans full width on mobile, 6 cols on desktop */}
            <div className="md:col-span-12 lg:col-span-6 relative">
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                エリア・駅・勤務地
              </Label>
              <Input
                placeholder="例: 大阪府大阪市北区大深町４−２０"
                className="h-12 text-lg pl-4 rounded-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Rent Cap */}
            <div className="md:col-span-4 lg:col-span-2 relative">
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                家賃上限 (万円)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="上限なし"
                  className="h-12 rounded-none pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                />
                <CurrencyJpy
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
              </div>
            </div>

            {/* Building Type */}
            <div className="md:col-span-4 lg:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                建物種別
              </Label>
              <Select value={buildingType} onValueChange={setBuildingType}>
                <SelectTrigger className="h-12 rounded-none">
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
            <div className="md:col-span-4 lg:col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                間取り
              </Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger className="h-12 rounded-none">
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
        </div>

        <div className="h-px bg-border/50 w-full" />

        {/* Section 2: Housing Allowance & Priorities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Housing Allowance */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="text-primary" size={24} />
                <h3 className="font-display text-lg tracking-wide">
                  家賃補助・福利厚生
                </h3>
              </div>
              <Switch
                checked={useAllowance}
                onCheckedChange={setUseAllowance}
              />
            </div>

            <div
              className={cn(
                "pl-7 space-y-4 transition-all duration-200",
                useAllowance
                  ? "opacity-100"
                  : "opacity-30 pointer-events-none grayscale"
              )}
            >
              <RadioGroup
                value={allowanceType}
                onValueChange={setAllowanceType}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="distance" id="card-distance" />
                  <Label
                    htmlFor="card-distance"
                    className="cursor-pointer font-normal"
                  >
                    会社から近い (km)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stations" id="card-stations" />
                  <Label
                    htmlFor="card-stations"
                    className="cursor-pointer font-normal"
                  >
                    駅数が近い
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex items-center gap-3">
                <Label className="text-sm shrink-0 w-12">条件:</Label>
                <Input
                  type="number"
                  placeholder="3.0"
                  value={allowanceValue}
                  onChange={(e) => setAllowanceValue(e.target.value)}
                  className="h-10 w-28 rounded-none font-mono text-base bg-background border border-input focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center"
                />{" "}
                <span className="text-sm text-muted-foreground">
                  {allowanceType === "distance" ? "km 以内" : "駅 以内"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-sm shrink-0 w-12">金額:</Label>
                <Input
                  type="number"
                  placeholder="3.0"
                  value={allowanceAmount}
                  onChange={(e) => setAllowanceAmount(e.target.value)}
                  className="h-10 w-28 rounded-none font-mono text-base bg-background border border-input focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center"
                />{" "}
                <span className="text-sm text-muted-foreground">万円 支給</span>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                ※ 最寄駅検索の基準になります
              </p>
            </div>
          </div>

          {/* Priorities */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Faders className="text-primary" size={24} />
              <h3 className="font-display text-lg tracking-wide">
                重視するポイント
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              {/* Price (formerly Rent) */}
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
          </div>
        </div>

        {/* Action Button */}
        <Button
          size="lg"
          className="w-full h-16 rounded-none font-display uppercase tracking-widest text-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl mt-4"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner className="h-6 w-6 animate-spin" />
          ) : (
            <div className="flex items-center justify-center gap-3">
              <MagnifyingGlass size={24} />
              <span>この条件で街を探す</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
