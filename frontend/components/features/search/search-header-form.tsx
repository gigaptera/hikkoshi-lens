"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyJpy } from "@phosphor-icons/react";

export function SearchHeaderForm() {
  const [maxRent, setMaxRent] = useState("");
  const [buildingType, setBuildingType] = useState("mansion");
  const [layout, setLayout] = useState("1r_1k_1dk");

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Rent Cap */}
      <div className="relative w-[140px]">
        <div className="relative group">
          <Input
            type="number"
            placeholder="上限なし"
            className="h-9 text-xs rounded-none pr-7 bg-background border border-border/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 px-3 transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
          />
          <Label className="absolute -top-2.5 left-0 text-[9px] text-muted-foreground uppercase tracking-wider pointer-events-none group-focus-within:text-primary transition-colors">
            家賃上限
          </Label>
          <CurrencyJpy
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            size={12}
          />
        </div>
      </div>

      {/* Building Type */}
      <div className="w-[120px] relative group">
        <Label className="absolute -top-2.5 left-0 text-[9px] text-muted-foreground uppercase tracking-wider pointer-events-none group-focus-within:text-primary transition-colors z-10">
          建物種別
        </Label>
        <Select value={buildingType} onValueChange={setBuildingType}>
          <SelectTrigger className="h-9 text-xs rounded-none bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20 px-3 shadow-sm">
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
      <div className="w-[120px] relative group">
        <Label className="absolute -top-2.5 left-0 text-[9px] text-muted-foreground uppercase tracking-wider pointer-events-none group-focus-within:text-primary transition-colors z-10">
          間取り
        </Label>
        <Select value={layout} onValueChange={setLayout}>
          <SelectTrigger className="h-9 text-xs rounded-none bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20 px-3 shadow-sm">
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
  );
}
