import React from 'react';
import Link from 'next/link';
import { getLatestAssessment } from '../actions';
import { HexagonRadar } from '@/components/feature/assessment/HexagonRadar';
import { Award, CheckCircle, Video, Users, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export default async function AssessmentResultPage() {
  const assessment = await getLatestAssessment();

  // 若无数据，展示默认兜底评估状态
  const data = assessment || {
    selfScore: 3.5,
    finalLevel: 3.5,
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
              <span className="font-bold text-white ml-1">{(data.confidence * 100).toFixed(0)}%</span>
            </p>
          </div>

          <div className="shrink-0 flex md:flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <Award className="w-10 h-10 text-amber-300 mb-1" />
            <div className="text-center">
              <div className="text-xs text-emerald-200">综合段位</div>
              <div className="text-2xl font-black tracking-wider text-amber-300">
                T{Math.floor(data.finalLevel)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 六维雷达图与能力解析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 雷达图展示卡片 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-gray-900">网球六维技术雷达</h2>
            <span className="text-xs text-gray-400">满分 10.0</span>
          </div>
          <HexagonRadar data={data.radar} size={280} />
          <div className="text-xs text-gray-400 mt-2">
            💡 数据基于正手、发球、网前、反手、步法、稳定性综合测算
          </div>
        </div>

        {/* 关键提升建议 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              针对性提升突破点 (Top 3)
            </h2>
            <div className="space-y-3">
              {data.topImprovements.map((item: string, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/assessment/video"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition border border-amber-200"
            >
              <Video className="w-4 h-4 text-amber-700" />
              上传 10秒 动作视频，解锁 AI 抽帧多模态精准评级
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
