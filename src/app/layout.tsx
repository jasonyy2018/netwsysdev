import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, MobileNavBar } from "@/components/shared/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TennisHub · 网球运动生态平台",
  description: "Next.js 16 + PostgreSQL 网球水平测评、智能约球匹配、场地预订与教练课程闭环",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50/50 flex flex-col pb-16 md:pb-0`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <MobileNavBar />
      </body>
    </html>
  );
}
