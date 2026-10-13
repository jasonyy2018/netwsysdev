import Link from 'next/link';
import { Trophy, Activity, MapPin, Users, UserCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            🎾
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Tennis<span className="text-emerald-600">Hub</span>
          </span>
        </Link>

        {/* 顶部简易导航 */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/assessment/self" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> 水平测评
          </Link>
          <Link href="/match" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <Users className="w-4 h-4" /> 智能约球
          </Link>
          <Link href="/court" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> 场地预订
          </Link>
          <Link href="/coach" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" /> 教练课程
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/assessment/self"
            className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
          >
            免费测等级
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileNavBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1.5 flex justify-around items-center">
      <Link href="/" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-emerald-600">
        <Trophy className="w-5 h-5" />
        <span>首页</span>
      </Link>
      <Link href="/assessment/self" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-emerald-600">
        <Activity className="w-5 h-5" />
        <span>测评</span>
      </Link>
      <Link href="/match" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-emerald-600">
        <Users className="w-5 h-5" />
        <span>约球</span>
      </Link>
      <Link href="/court" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-emerald-600">
        <MapPin className="w-5 h-5" />
        <span>订场</span>
      </Link>
      <Link href="/coach" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-emerald-600">
        <UserCheck className="w-5 h-5" />
        <span>教练</span>
      </Link>
    </nav>
  );
}
