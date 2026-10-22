'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MatchDetail } from '@/lib/schemas/match';
import { UserSession } from '@/lib/schemas/auth';
import { joinMatchRequest } from '@/app/(main)/match/actions';
import { Users, MapPin, Calendar, PlusCircle, CheckCircle, Award, Sparkles, Filter, Check } from 'lucide-react';

interface MatchListClientProps {
  initialMatches: MatchDetail[];
  user: UserSession | null;
}

export function MatchListClient({ initialMatches, user }: MatchListClientProps) {
  const [matches, setMatches] = useState<MatchDetail[]>(initialMatches);
  const [filterType, setFilterType] = useState<string>('all');
  const [onlyFitMyLevel, setOnlyFitMyLevel] = useState<boolean>(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedSuccess, setJoinedSuccess] = useState<Record<string, boolean>>({});

  const filtered = matches.filter((m) => {
    if (filterType !== 'all' && m.match_type !== filterType) return false;
    if (onlyFitMyLevel && user) {
      if (user.level_num < m.level_min || user.level_num > m.level_max) {
        return false;
      }
    }
    return true;
  });

  const handleJoin = async (matchId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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

      {/* 用户段位与智能匹配状态横幅 */}
      {user ? (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
              T{user.level_num.toFixed(1)}
            </span>
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>{user.nickname}，系统已启动基于您段位的智能匹配</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                为您高亮标出符合您水平区间（T{(user.level_num - 0.5).toFixed(1)} ~ T{(user.level_num + 0.5).toFixed(1)}）的优质球局
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFitMyLevel(!onlyFitMyLevel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                onlyFitMyLevel
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${onlyFitMyLevel ? 'opacity-100' : 'opacity-0'}`} />
              只看契合我水平 (T{user.level_num.toFixed(1)})
            </button>
            <Link
              href="/assessment/self"
              className="text-xs text-gray-500 hover:text-emerald-700 px-2.5 py-1.5 rounded-xl font-medium"
            >
              重测水平
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-amber-900">
            <span className="font-bold">尚未完成水平测评？</span> 
            仅需 2 分钟问卷，即可测定 T1-T10 段位并体验智能对局匹配。
          </div>
          <Link
            href="/assessment/self"
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold text-center shrink-0"
          >
            去自评定级
          </Link>
        </div>
      )}

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
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-150">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">当前筛选暂无约球需求</h3>
            <p className="text-xs text-gray-400 mt-1">
              {onlyFitMyLevel ? '尝试取消“只看契合我水平”筛选，或自己发起一个球局吧！' : '成为第一个发起同城球局的人吧！'}
            </p>
          </div>
        ) : (
          filtered.map((match) => {
            const isFull = match.participants_count >= match.slots_needed + 1;
            const hasJoined = joinedSuccess[match.id];
            const startDate = new Date(match.start_time);
            const dateStr = `${startDate.getMonth() + 1}月${startDate.getDate()}日 ${String(
              startDate.getHours()
            ).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

            // 是否契合当前用户段位
            const isLevelFit =
              user &&
              user.level_num >= match.level_min &&
              user.level_num <= match.level_max;

            return (
              <div
                key={match.id}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isLevelFit ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-150 hover:border-gray-300'
                }`}
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
                      <div className="flex items-center gap-2 flex-wrap">
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
                        {isLevelFit && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            契合您的 T{user.level_num.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
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
                  ) : !user ? (
                    <Link
                      href="/login?redirect=/match"
                      className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                    >
                      登录后报名
                    </Link>
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
