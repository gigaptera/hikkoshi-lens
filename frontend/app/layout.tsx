import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans_JP,
  Playfair_Display,
  JetBrains_Mono,
} from "next/font/google"; // Turbo
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalHeader } from "@/components/layout/global-header";
import { GlobalFooter } from "@/components/layout/global-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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
        className={`${inter.variable} ${notoSansJP.variable} ${playfair.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <ModeToggle /> moved to GlobalHeader */}
          <div className="flex flex-col min-h-screen">
            <GlobalHeader />
            <div className="flex-1 pb-20 lg:pb-0">{children}</div>
            <GlobalFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
