import type { Metadata } from "next";
import { Noto_Sans_KR, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Epic Sense - 에픽세븐 실레나 픽 추천 & 장비 세팅 도구",
  description: "에픽세븐 실시간 아레나 픽 추천, 장비 세팅, 강화 서포터를 무료로 제공하는 팬 사이트",
  keywords: ["에픽세븐", "실레나", "RTA", "픽 추천", "장비 세팅", "강화 서포터"],
  openGraph: {
    title: "Epic Sense - 에픽세븐 게임 도구 플랫폼",
    description: "에픽세븐 실시간 아레나 픽 추천, 장비 세팅, 강화 서포터를 무료로 제공하는 팬 사이트",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${inter.variable}`}>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
