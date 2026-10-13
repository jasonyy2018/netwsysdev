'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MatchDetail } from '@/lib/schemas/match';
import { joinMatchRequest } from '@/app/(main)/match/actions';
import { Users, MapPin, Calendar, PlusCircle, CheckCircle, Award, Sparkles, Filter } from 'lucide-react';

interface MatchListClientProps {
  initialMatches: MatchDetail[];
}

export function MatchListClient({ initialMatches }: MatchListClientProps) {
  const [matches, setMatches] = useState<MatchDetail[]>(initialMatches);
  const [filterType, setFilterType] = useState<string>('all');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedSuccess, setJoinedSuccess] = useState<Record<string, boolean>>({});

  const filtered = matches.filter((m) => {
    if (filterType === 'all') return true;
    return m.match_type === filterType;
  });

  const handleJoin = async (matchId: string) => {
    setJoiningId(matchId);
    try {
      const res = await joinMatchRequest(matchId);
      if (res.success) {
        setJoinedSuccess((prev) => ({ ...prev, [matchId]: true }));
        setMatches((prev) =>
          prev.map((item) =>
            item.id === matchId
              ? { ...item, participants_count: item.participants_count + 1 }
              : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 顶部标题与发布行动 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            同城智能约球
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            严谨匹配 T1-T10 水平相当的同城球友，基于加权算法推荐高质量对局。
          </p>
        </div>

        <Link
          href="/match/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          发起约球需求
        </Link>
      </div>

      {/* 快捷筛选器 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
        {[
          { key: 'all', label: '全部球局' },
          { key: 'singles', label: '单打对抗' },
          { key: 'doubles', label: '双打轮转' },
          { key: 'rally', label: '中速对拉练习' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterType(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filterType === tab.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 约球卡片流 */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">当前筛选暂无约球需求</h3>
            <p className="text-xs text-gray-400 mt-1">成为第一个发起同城球局的人吧！</p>
          </div>
        ) : (
          filtered.map((match) => {
            const isFull = match.participants_count >= match.slots_needed + 1;
            const hasJoined = joinedSuccess[match.id];
            const startDate = new Date(match.start_time);
            const dateStr = `${startDate.getMonth() + 1}月${startDate.getDate()}日 ${String(
              startDate.getHours()
            ).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

            return (
              <div
                key={match.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* 左侧发起人与球局核心信息 */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-3">
                    <img
                      src={match.creator_avatar}
                      alt={match.creator_nickname}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {match.creator_nickname}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                          <Award className="w-3 h-3 text-amber-600" />
                          T{match.creator_level.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          信用 {match.creator_credit}分
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        招募等级区间：
                        <span className="font-bold text-emerald-700 ml-1">
                          T{match.level_min.toFixed(1)} - T{match.level_max.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{match.title}</h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{match.court_name}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <span>费用：{match.cost_mode === 'aa' ? '平摊 AA' : match.cost_mode === 'creator_pays' ? '发起人请客' : '败者付费'}</span>
                    </div>
                  </div>

                  {match.notes && (
                    <p className="text-xs text-gray-400 italic bg-gray-50/80 p-2 rounded-lg">
                      “{match.notes}”
                    </p>
                  )}
                </div>

                {/* 右侧参与情况与加入按钮 */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">已招募 / 满员</div>
                    <div className="text-sm font-black text-gray-800">
                      {match.participants_count} / {match.slots_needed + 1} 人
                    </div>
                  </div>

                  {hasJoined ? (
                    <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> 已成功加入
                    </span>
                  ) : isFull ? (
                    <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold">
                      已满员
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={joiningId === match.id}
                      onClick={() => handleJoin(match.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                    >
                      {joiningId === match.id ? '正在报名...' : '立即报名'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
