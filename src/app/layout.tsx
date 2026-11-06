import type { Metadata } from "next";
import { Noto_Sans_SC, Sora } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const body = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "硬价台 · PC 硬件最低价看板",
  description:
    "汇总京东、天猫、拼多多、淘宝的 GPU / 内存 / 存储 / CPU 最低价，并附国内外硬件新闻与价格走势。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-[var(--muted)] sm:px-6">
          硬价台 MVP · 遵守站点服务条款；不绕过登录/反爬墙。电商报价在实采不可用时以演示数据驱动 UI
          与历史走势。
        </footer>
      </body>
    </html>
  );
}
