import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { ConcreteBackground } from "@/components/layout/concrete-background";
import { IconProvider } from "@/components/providers/icon-provider";

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
    <html lang="ja">
      <body
        className={`${inter.className} ${notoSansJP.className} antialiased`}
      >
        <IconProvider>
          <ConcreteBackground>{children}</ConcreteBackground>
        </IconProvider>
      </body>
    </html>
  );
}
