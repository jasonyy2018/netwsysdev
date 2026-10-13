import type { Metadata } from "next";
import "./globals.css";
import { Header, MobileNavBar } from "@/components/shared/Navbar";

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
      <body className="antialiased min-h-screen bg-slate-50/50 flex flex-col pb-16 md:pb-0 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <MobileNavBar />
      </body>
    </html>
  );
}
