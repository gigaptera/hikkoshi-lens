import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { ConcreteBackground } from "@/components/layout/concrete-background";
import { IconProvider } from "@/components/providers/icon-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";

const inter = Inter({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Hikkoshi Lens",
  description: "Data-driven relocation intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${inter.className} ${notoSansJP.className} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ConcreteBackground>
            <IconProvider>
              <AppShell>{children}</AppShell>
            </IconProvider>
          </ConcreteBackground>
        </ThemeProvider>
      </body>
    </html>
  );
}
