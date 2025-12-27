import { LivabilityScore } from "@/components/domain/livability-score";
import { StationRadarChart } from "@/components/features/station/station-radar-chart";
import { StationMap } from "@/components/features/station/station-map";
import { FacilityList } from "@/components/features/station/facility-list";
import { StationListCard } from "@/components/features/station/station-list-card";
import { AllowanceInput } from "@/components/features/search/allowance-input";
import { PreferenceTuner } from "@/components/features/search/preference-tuner";
import { HousingConditionsInput } from "@/components/features/search/housing-conditions-input";
import { DesignSectionWrapper } from "./design-section-wrapper";

export function DomainDesignSection() {
  return (
    <DesignSectionWrapper
      title="Station & Search Components"
      description="Components for the new Station Search pivot."
    >
      <div className="space-y-12">
        {/* Search Results */}
        <section className="space-y-6">
          <h3 className="font-bold text-xl border-b pb-2">
            0. Search Result Card (New)
          </h3>
          <div className="space-y-4 max-w-2xl mx-auto">
            <StationListCard
              rank={1}
              stationName="高円寺"
              lines={["JR中央線", "JR総武線"]}
              timeToWork="24分"
              transferCount={0}
              marketRent={9.8}
              realRent={7.8}
              score={92}
              tags={["商店街が充実", "物価が安い", "アクセス良好"]}
            />
            <StationListCard
              rank={2}
              stationName="中野"
              lines={["JR中央線", "東京メトロ東西線"]}
              timeToWork="22分"
              transferCount={0}
              marketRent={10.5}
              realRent={8.5}
              score={88}
              tags={["始発駅", "サブカルの聖地"]}
            />
          </div>
        </section>

        {/* Station Analysis */}
        <section className="space-y-6">
          <h3 className="font-bold text-xl border-b pb-2">
            1. Station Analysis (Metrics)
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-8 justify-center bg-card border rounded-xl p-8">
            <StationRadarChart
              data={[
                { label: "物価", score: 85 },
                { label: "治安", score: 60 },
                { label: "アクセス", score: 90 },
                { label: "周辺施設", score: 75 },
                { label: "防災", score: 70 },
              ]}
              className="bg-background rounded-full shadow-inner p-4"
            />
            <div className="space-y-2 max-w-xs">
              <h4 className="font-bold text-xl text-primary">
                Kouenji Station
              </h4>
              <p className="text-sm text-muted-foreground">
                物価が安く、アクセスも良好。治安は平均的だが、商店街が充実しており生活利便性は非常に高い。
              </p>
            </div>
          </div>

          <div className="flex items-end gap-12 bg-muted/20 p-8 rounded-xl justify-center">
            <LivabilityScore score={92} size="lg" label="総合スコア" />
            <LivabilityScore score={75} size="md" label="治安" />
            <LivabilityScore score={45} size="sm" label="物価" />
          </div>
        </section>

        {/* Map & Facilities */}
        <section className="space-y-6">
          <h3 className="font-bold text-xl border-b pb-2">
            2. Map & Facilities (Interactive)
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-bold text-sm text-muted-foreground">
                Station Map (With Layers)
              </h4>
              <StationMap stationName="Kouenji" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-muted-foreground">
                Nearby Listings
              </h4>
              <FacilityList
                facilities={[
                  {
                    name: "Global Gym 24",
                    category: "gym",
                    distance: "徒歩2分",
                    tags: ["24時間", "プールあり"],
                  },
                  {
                    name: "Aeon Food Style",
                    category: "supermarket",
                    distance: "徒歩4分",
                    tags: ["深夜1時まで", "安い"],
                  },
                  {
                    name: "Create Drug",
                    category: "pharmacy",
                    distance: "徒歩3分",
                    tags: ["処方箋"],
                  },
                  {
                    name: "Starbucks",
                    category: "cafe",
                    distance: "徒歩1分",
                    tags: ["Wi-Fi", "電源"],
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Search Logic */}
        <section className="space-y-6">
          <h3 className="font-bold text-xl border-b pb-2">3. Search Inputs</h3>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="font-bold text-lg">予算 & 補助 (Logic B)</h4>
              <div className="p-6 border rounded-xl bg-card">
                <AllowanceInput />
              </div>

              <h4 className="font-bold text-lg">重視項目 (Preference)</h4>
              <div className="p-6 border rounded-xl bg-card">
                <PreferenceTuner />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-lg">住環境条件</h4>
              <div className="p-6 border rounded-xl bg-card">
                <HousingConditionsInput />
              </div>
            </div>
          </div>
        </section>
      </div>
    </DesignSectionWrapper>
  );
}
