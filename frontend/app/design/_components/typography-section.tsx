import { DesignSectionWrapper } from "./design-section-wrapper";

export function TypographyDesignSection() {
  return (
    <DesignSectionWrapper title="Typography">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tight">
          Heading 1 (Black Space)
        </h1>
        <h2 className="text-4xl font-black tracking-tight">
          Heading 2 (Launch Site)
        </h2>
        <h3 className="text-3xl font-bold tracking-tight">
          Heading 3 (Discovery)
        </h3>
        <h4 className="text-xl font-bold">Heading 4 (Feature)</h4>
        <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">
          Body text using Inter and Noto Sans JP. This is a sample paragraph to
          demonstrate readability and line height. The quick brown fox jumps
          over the lazy dog.
          日本語のテキスト表示確認。すべての人間は、生まれながらにして自由であり、かつ、尊厳と権利とについて平等である。
        </p>
      </div>
    </DesignSectionWrapper>
  );
}
