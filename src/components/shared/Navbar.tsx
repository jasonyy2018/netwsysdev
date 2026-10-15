import Link from 'next/link';
import { Trophy, Activity, MapPin, Users, UserCheck, Shield, User, LayoutDashboard } from 'lucide-react';
import { getCurrentUser } from '@/app/(auth)/actions';

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-150">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            🎾
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Tennis<span className="text-emerald-600">Hub</span>
          </span>
        </Link>

        {/* 顶部主导航 */}
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
          <Link href="/my/credit" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" /> 信用分
          </Link>

          {/* 管理员专属后台入口 */}
          {user && user.role === 'admin' && (
            <Link
              href="/admin"
              className="text-purple-900 hover:text-purple-700 font-bold transition flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-700" />
              运营后台
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/my/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold transition border border-gray-200"
            >
              <img
                src={user.avatar_url}
                alt={user.nickname}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="max-w-[100px] truncate">{user.nickname}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                登录 / 注册
              </Link>
            </div>
          )}
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
      <Link href="/my/profile" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-emerald-600">
        <User className="w-5 h-5" />
        <span>我的</span>
      </Link>
    </nav>
  );
}
