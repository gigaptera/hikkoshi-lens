import { Panel } from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { EmergencyBanner } from "@/components/ui/emergency-banner";
import { StepIndicator } from "@/components/ui/step-indicator";
import {
  DescriptionList,
  DescriptionItem,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list";
import { QuoteBlock } from "@/components/ui/quote-block";
import { SearchBox } from "@/components/ui/search-box";
import { UtilityLink } from "@/components/ui/utility-link";
import { DesignSectionWrapper } from "./design-section-wrapper";

export function DADSDesignSection() {
  return (
    <DesignSectionWrapper
      title="DADS Extended Components"
      description="Components based on Digital Agency Design System (Japanese Gov) standards."
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-bold">Emergency Banner</h3>
          <div className="space-y-2">
            <EmergencyBanner title="Emergency Alert" dismissible>
              Thi is a critical alert message that needs immediate attention.
              Usually appears at the top of the page.
              避難指示などの緊急情報（レベル1）を表示します。
            </EmergencyBanner>
            <EmergencyBanner title="Warning Notice" variant="warning">
              System maintenance is scheduled for tonight at 11:00 PM.
              注意喚起情報（レベル2）を表示します。
            </EmergencyBanner>
            <EmergencyBanner title="Information" variant="info">
              New feature update available. 周知情報（レベル3）を表示します。
            </EmergencyBanner>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-bold">Step Navigation (Stepper)</h3>
          <Panel variant="solid" padding="default">
            <StepIndicator
              currentStep={2}
              totalSteps={4}
              labels={["Basic Info", "Preferences", "Confirmation", "Complete"]}
            />
          </Panel>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold">Description List</h3>
            <Panel variant="glass">
              <DescriptionList>
                <DescriptionItem>
                  <DescriptionTerm>Full Name</DescriptionTerm>
                  <DescriptionDetails>Taro Yamada</DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem>
                  <DescriptionTerm>Email</DescriptionTerm>
                  <DescriptionDetails>
                    taro.yamada@example.com
                  </DescriptionDetails>
                </DescriptionItem>
                <DescriptionItem>
                  <DescriptionTerm>Role</DescriptionTerm>
                  <DescriptionDetails>Administrator</DescriptionDetails>
                </DescriptionItem>
              </DescriptionList>
            </Panel>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold">Quote / Blockquote</h3>
            <QuoteBlock source="Digital Agency Design System">
              ユーザー中心のデザインプロセスを通じて、誰一人取り残されない、人に優しいデジタル化を。
            </QuoteBlock>
          </div>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold">Search Box</h3>
            <div className="p-4 bg-muted/30 rounded-lg">
              <SearchBox onSearch={(val) => console.log(val)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold">Utility Links</h3>
            <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg">
              <UtilityLink href="/login">Login</UtilityLink>
              <UtilityLink href="https://example.com" external>
                External Site help
              </UtilityLink>
              <UtilityLink href="/terms">Terms of Service</UtilityLink>
            </div>
          </div>
        </div>
      </div>
    </DesignSectionWrapper>
  );
}
