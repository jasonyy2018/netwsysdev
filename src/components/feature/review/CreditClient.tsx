'use client';

import React, { useState } from 'react';
import { UserCreditProfile, CreditEventItem } from '@/lib/schemas/review';
import { submitReview } from '@/app/(main)/my/credit/actions';
import { ShieldCheck, TrendingUp, TrendingDown, Star, AlertTriangle, CheckCircle2, Award, History, Sparkles } from 'lucide-react';

interface CreditClientProps {
  initialProfile: UserCreditProfile;
  initialEvents: CreditEventItem[];
}

export function CreditClient({ initialProfile, initialEvents }: CreditClientProps) {
  const [profile, setProfile] = useState<UserCreditProfile>(initialProfile);
  const [events, setEvents] = useState<CreditEventItem[]>(initialEvents);
  
  // 模拟约球互评弹窗状态
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['准时到场', '球风好']);
  const [isNoShow, setIsNoShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const availableTags = ['准时到场', '球风文明', '技术扎实', '擅长沟通', '自带新球'];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessToast('');

    try {
      const res = await submitReview({
        target_id: '22222222-2222-2222-2222-222222222222',
        target_type: 'player',
        rating,
        tags: selectedTags,
        is_no_show: isNoShow,
        comment: isNoShow ? '未按时赴约' : '打得很尽兴，期待下次再约！',
      });

      if (res.success) {
        setSuccessToast(isNoShow ? '已上报爽约，系统已对放鸽子者扣除5分信用分' : '互评成功！球友信用分 +1');
        setShowReviewModal(false);
        // 本地追加一条模拟动态展示效果
        setEvents((prev) => [
          {
            id: `ce-${Date.now()}`,
            user_id: profile.id,
            delta: isNoShow ? -5 : 1,
            reason: isNoShow ? '对方未到场标记放鸽子核实' : '完成双向互评履约',
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch {
      // 容错
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 顶部标题与行动 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            信用分体系与履约流水
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            健康纯净的网球社区基石，初始 80 分，严惩爽约放鸽子，履约加权激励。
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReviewModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
        >
          <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
          模拟球局结束互评
        </button>
      </div>

      {successToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 信用分仪表总览 */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-gray-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar_url}
              alt={profile.nickname}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{profile.nickname}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950">
                  T{profile.level_num.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1">
                累计完成约球 {profile.completed_matches_count} 场 · 爽约记录 {profile.no_show_count} 次
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-6">
            <div>
              <div className="text-xs text-emerald-200">当前信用分</div>
              <div className="text-4xl font-black text-amber-300 tracking-wider">
                {profile.credit_score}
                <span className="text-sm font-normal text-white/60 ml-1">/ 100</span>
              </div>
            </div>
            <div className="text-xs text-right border-l border-white/15 pl-4">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold mb-1">
                信用极佳
              </span>
              <div className="text-emerald-100/70">约球推荐加权 +10%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 信用分变动流水列表 */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            信用履约流水明细
          </h3>
          <span className="text-xs text-gray-400">仅 service_role 可写，本人可读</span>
        </div>

        <div className="space-y-3">
          {events.map((evt) => {
            const isPositive = evt.delta > 0;
            const dateStr = new Date(evt.created_at).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={evt.id}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPositive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{evt.reason}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{dateStr}</div>
                  </div>
                </div>

                <div
                  className={`text-base font-black shrink-0 ${
                    isPositive ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {isPositive ? `+${evt.delta}` : evt.delta}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 互评弹窗 */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900">球局履约双向互评</h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  综合打分 (1 - 5 星)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-600 ml-2">{rating} 星</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  评价标签
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 放鸽子严重违约勾选 */}
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="noShowCheck"
                  checked={isNoShow}
                  onChange={(e) => setIsNoShow(e.target.checked)}
                  className="mt-0.5 rounded text-red-600"
                />
                <label htmlFor="noShowCheck" className="text-xs text-red-900 cursor-pointer">
                  <span className="font-bold">标记爽约未到场 (放鸽子)</span>
                  <div className="text-red-700/80 text-[11px] mt-0.5">
                    双方核实后系统将自动扣除违约者 5 分信用分并记入履约档案。
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                {submitting ? '正在提交评价...' : '提交互评'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
