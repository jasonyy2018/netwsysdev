import Link from "next/link";
import { getCurrentUser } from "@/app/(auth)/actions";
import { Activity, Users, MapPin, UserCheck, ShieldCheck, ArrowRight, Sparkles, Award, Shield, User } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
      {/* 登录用户专属问候横幅 */}
      {user && (
        <div className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url}
              alt={user.nickname}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">{user.nickname}，欢迎回来！</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 flex items-center gap-0.5">
                  <Award className="w-3 h-3 text-amber-900" />
                  T{user.level_num.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-300" /> 信用分: <strong>{user.credit_score}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-300" /> {user.city}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/my/profile"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-xs flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              球友空间
            </Link>
            <Link
              href="/match"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              契合我的球局
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          网球运动生态平台 · 权威评级与同城约战
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
          测出真正等级，<br />
          <span className="text-emerald-600">约到旗鼓相当的对手</span>
        </h1>
        <p className="mt-4 text-base text-gray-600">
          打通「T1-T10 水平测评 → 智能地理约球 → 场地并发预订 → 专业教练认证」的最小交易闭环。
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/assessment/self"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4" /> 2分钟获取您的 T1-T10 等级
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/match"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm shadow-xs transition flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" /> 查看同城约球
          </Link>
        </div>
      </div>

      {/* 4 核心模块卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <Link
          href="/assessment/self"
          className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-emerald-500 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">水平测评体系</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            12题自评 + AI动作视频抽帧评级 + 六维能力雷达图，终结盲目估分。
          </p>
        </Link>

        <Link
          href="/match"
          className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-emerald-500 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">智能约球匹配</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            基于加权算法（等级差、距离、时段、信用分）推荐最契合球友。
          </p>
        </Link>

        <Link
          href="/court"
          className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-emerald-500 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">场地查询与预订</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            按距离价格筛选，14天时段网格选择，数据库事务防超卖保护。
          </p>
        </Link>

        <Link
          href="/coach"
          className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-emerald-500 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">认证教练课程</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            资质证书入驻审核，时段冲突检测，5% 平台抽成透明记录。
          </p>
        </Link>
      </div>

      {/* 底部技术保障信誉栏 */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-gray-700">技术规范落地：</span>
          Next.js 16.4 App Router · PostgreSQL 16 · Docker 容器编排 · 严格 TypeScript
        </div>
        <div className="flex items-center gap-4">
          <span>防超卖锁保护</span>
          <span>·</span>
          <span>信用分履约流水</span>
          <span>·</span>
          <span>整数分计价</span>
        </div>
      </div>
    </div>
  );
}
