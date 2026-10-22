import React from 'react';
import Link from 'next/link';
import { getLatestAssessment } from '../actions';
import { getCurrentUser } from '@/app/(auth)/actions';
import { HexagonRadar } from '@/components/feature/assessment/HexagonRadar';
import { Award, CheckCircle, Video, Users, UserCheck, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';

export default async function AssessmentResultPage() {
  const [assessment, user] = await Promise.all([
    getLatestAssessment(),
    getCurrentUser(),
  ]);

  // 若无数据，展示默认兜底评估状态
  const data = assessment || {
    selfScore: 3.5,
    finalLevel: user?.level_num || 3.5,
    confidence: 0.88,
    radar: {
      forehand: 6.8,
      backhand: 5.5,
      serve: 6.0,
      volley: 4.8,
      footwork: 6.5,
      consistency: 6.2,
    },
    topImprovements: [
      '正手引拍过大导致击球点偏后，需提早分腿垫步并固定击球点',
      '反手过渡切削弧线较浅，建议增加随挥长度与拍面倾角稳定性',
      '二发抛球点不够稳定，建议练习钟表12点位置抛球与向上刷旋转',
    ],
  };

  // 等级称号定义
  const getLevelBadge = (level: number) => {
    if (level < 2.0) return { title: 'T1 入门启蒙', tag: 'NTRP 1.0 - 1.5' };
    if (level < 3.0) return { title: 'T2 基础球友', tag: 'NTRP 2.0 - 2.5' };
    if (level < 4.0) return { title: 'T3 进阶拉球', tag: 'NTRP 3.0' };
    if (level < 5.0) return { title: 'T4 战术达人', tag: 'NTRP 3.5' };
    if (level < 6.0) return { title: 'T5 强攻高手', tag: 'NTRP 4.0' };
    if (level < 7.0) return { title: 'T6 俱乐部精英', tag: 'NTRP 4.5' };
    return { title: 'T7+ 巅峰大师', tag: 'NTRP 5.0+' };
  };

  const badgeInfo = getLevelBadge(data.finalLevel);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 游客态 vs 登录态 档案绑定提示栏 */}
      {!user ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="text-xs space-y-0.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>游客预览模式：测评结果尚未绑定到球友账号</span>
            </div>
            <p className="text-amber-700">
              立即登录或注册，即可永久保存您的 <strong>T{data.finalLevel.toFixed(1)}</strong> 段位档案与技术雷达图，并开启智能约球匹配！
            </p>
          </div>
          <Link
            href="/login?redirect=/assessment/result"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 text-center shadow-xs"
          >
            登录并绑定档案
          </Link>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>评级已成功同步至球友档案：<strong>{user.nickname}</strong>（当前评级 T{user.level_num.toFixed(1)}）</span>
          </div>
          <Link href="/my/profile" className="font-bold text-emerald-800 hover:underline">
            查看个人空间 →
          </Link>
        </div>
      )}

      {/* 顶部荣誉卡片 */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              TennisHub 权威水平评级
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              等级评估：T{data.finalLevel.toFixed(1)}
              <span className="text-xl md:text-2xl font-bold text-emerald-300">({badgeInfo.title})</span>
            </h1>
            <p className="text-emerald-100/90 text-sm mt-2 max-w-md">
              根据您的问卷自评与动作习惯综合计算，对应国际网联标准 {badgeInfo.tag}。置信度：
              <span className="font-bold text-emerald-200 ml-1">
                {(data.confidence * 100).toFixed(0)}%
              </span>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 min-w-[130px]">
            <Award className="w-10 h-10 text-amber-300 mb-1" />
            <div className="text-xs font-medium text-emerald-200">段位认证状态</div>
            <div className="text-sm font-extrabold text-white mt-0.5">自评定级已确认</div>
          </div>
        </div>
      </div>

      {/* 六维雷达图与诊断报告 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs flex flex-col items-center justify-center">
          <h2 className="text-sm font-bold text-gray-900 mb-4 self-start">
            技术六维能力雷达图
          </h2>
          <HexagonRadar data={data.radar} size={300} />
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-[11px] text-gray-500 font-medium">
            <span>正手 {data.radar.forehand}</span>·
            <span>反手 {data.radar.backhand}</span>·
            <span>发球 {data.radar.serve}</span>·
            <span>截击 {data.radar.volley}</span>·
            <span>步伐 {data.radar.footwork}</span>·
            <span>稳定性 {data.radar.consistency}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              AI 专家诊断与优先提升建议
            </h2>
            <div className="space-y-3">
              {(data.topImprovements as string[]).map((tip: string, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href={user ? "/assessment/video" : "/login?redirect=/assessment/video"}
              className="w-full py-3 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4 text-purple-600" />
              上传技术视频，开启 AI 抽帧精准复核
            </Link>
          </div>
        </div>
      </div>

      {/* 核心闭环跳转行动区 */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">等级已确定！立刻开启您的网球旅程</h3>
          <p className="text-xs text-gray-500 mt-1">系统已根据您的 T{data.finalLevel.toFixed(1)} 水平就绪同城球友推荐与场地筛选</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/coach"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-gray-500" />
            预约教练复核
          </Link>
          <Link
            href="/match"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition"
          >
            <Users className="w-4 h-4" />
            匹配附近球友
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
