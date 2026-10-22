'use client';

import React, { useState } from 'react';
import { UserSession } from '@/lib/schemas/auth';
import { updateProfile, logout } from '@/app/(auth)/actions';
import { MyBookingItem, MyMatchItem, MyCoachOrderItem, completeMatch } from '@/app/(main)/my/profile/actions';
import { submitReview } from '@/app/(main)/my/credit/actions';
import { 
  User, Phone, MapPin, Award, Shield, Loader2, LogOut, CheckCircle2, 
  Calendar, Clock, Building, Users, Star, ArrowRight, Check, Sparkles, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

interface ProfileClientProps {
  user: UserSession;
  bookings: MyBookingItem[];
  matches: MyMatchItem[];
  coachOrders: MyCoachOrderItem[];
  initialTab?: string;
}

export function ProfileClient({
  user,
  bookings,
  matches: initialMatches,
  coachOrders,
  initialTab = 'profile',
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'matches' | 'bookings' | 'coaches'>(
    (initialTab as any) || 'profile'
  );

  const [matchesList, setMatchesList] = useState<MyMatchItem[]>(initialMatches);
  const [formData, setFormData] = useState({
    nickname: user.nickname,
    city: user.city,
    play_preference: user.play_preference,
    bio: '业余网球狂热爱好者，周末必拉球，平时有空单打切磋。',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // 局后互评弹窗状态
  const [reviewMatch, setReviewMatch] = useState<MyMatchItem | null>(null);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['准时到场', '球风文明']);
  const [isNoShow, setIsNoShow] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const availableTags = ['准时到场', '球风文明', '技术扎实', '擅长沟通', '自带新球'];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMsg('');

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setToastMsg('个人资料已成功保存！');
      }
    } catch {
      //
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteAndReview = async (match: MyMatchItem) => {
    try {
      await completeMatch(match.id);
      setMatchesList((prev) =>
        prev.map((m) => (m.id === match.id ? { ...m, status: 'completed' } : m))
      );
      setReviewMatch(match);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewMatch) return;
    setSubmittingReview(true);

    try {
      const res = await submitReview({
        target_id: reviewMatch.creator_id === user.id ? '22222222-2222-2222-2222-222222222222' : reviewMatch.creator_id,
        target_type: 'player',
        rating,
        tags: selectedTags,
        is_no_show: isNoShow,
        comment: isNoShow ? '爽约未到场' : '打得很尽兴，对局非常精彩！',
        match_id: reviewMatch.id,
      });

      if (res.success) {
        setToastMsg(isNoShow ? '已上报爽约，系统已对放鸽子者扣除5分信用分' : '互评成功！球友信用分已更新');
        setReviewMatch(null);
      }
    } catch {
      //
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 顶部标题与退出 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            个人中心与球友空间
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            统筹管理您的球友段位、约球对局、订场记录与教练预约
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" /> 退出登录
        </button>
      </div>

      {toastMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 核心用户身份卡片 */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url}
            alt={user.nickname}
            className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{user.nickname}</h2>
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">
                  平台管理员
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-400" />
                {user.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {user.city}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/assessment/result"
            className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center flex-1 sm:flex-none min-w-[95px] hover:border-amber-300 transition"
          >
            <div className="text-[11px] text-amber-800 font-semibold flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-600" /> 等级
            </div>
            <div className="text-xl font-black text-amber-900 mt-0.5">
              T{user.level_num.toFixed(1)}
            </div>
          </Link>

          <Link
            href="/my/credit"
            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex-1 sm:flex-none min-w-[95px] hover:border-emerald-300 transition"
          >
            <div className="text-[11px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" /> 信用分
            </div>
            <div className="text-xl font-black text-emerald-900 mt-0.5">
              {user.credit_score}分
            </div>
          </Link>
        </div>
      </div>

      {/* 模块标签导航切换 */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-150 pb-3">
        {[
          { key: 'profile', label: '球友档案', count: null },
          { key: 'matches', label: '我的约球', count: matchesList.length },
          { key: 'bookings', label: '场地预订', count: bookings.length },
          { key: 'coaches', label: '私教约课', count: coachOrders.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key as any);
              setToastMsg('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: 我的约球 */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">全部参与及发起的球局</h3>
            <Link
              href="/match/create"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              + 发起新约球
            </Link>
          </div>

          {matchesList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-150">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">暂无参加或发起的球局</p>
              <Link
                href="/match"
                className="mt-3 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                前往约球大厅寻找球局
              </Link>
            </div>
          ) : (
            matchesList.map((m) => {
              const startDate = new Date(m.start_time);
              const dateStr = `${startDate.getMonth() + 1}月${startDate.getDate()}日 ${String(
                startDate.getHours()
              ).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        m.status === 'completed'
                          ? 'bg-gray-100 text-gray-600'
                          : m.status === 'matched'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.status === 'completed' ? '已完赛' : m.status === 'matched' ? '已成局·待开打' : '招募中'}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{m.title}</span>
                      {m.is_creator && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                          我是发起人
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {m.court_name}
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        招募 T{m.level_min.toFixed(1)} ~ T{m.level_max.toFixed(1)} · {m.match_type === 'doubles' ? '双打' : '单打'} ({m.participants_count}/{m.slots_needed + 1}人)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.status === 'matched' && (
                      <button
                        type="button"
                        onClick={() => handleCompleteAndReview(m)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        标记打完 & 互评
                      </button>
                    )}
                    {m.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => setReviewMatch(m)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        球局互评
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: 我的场地预订 */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">全部预订与锁定时段</h3>
            <Link
              href="/court"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              + 预订新场地
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-150">
              <Building className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">暂无订场订单记录</p>
              <Link
                href="/court"
                className="mt-3 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                去查询并预订球场
              </Link>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                      已支付·时段锁定
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{b.venue_name}</h4>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span>{b.court_name}</span>
                    <span>·</span>
                    <span>实付：¥{(b.amount_cents / 100).toFixed(0)}</span>
                    <span>·</span>
                    <span className="text-gray-400">单号: {b.id.slice(0, 12)}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{b.venue_address}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/match/create?venue_id=${encodeURIComponent(b.venue_id || '')}&court_name=${encodeURIComponent(b.venue_name)}&cost_cents=${b.amount_cents}`}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    基于此场地发起约球 (AA)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: 我的私教约课 */}
      {activeTab === 'coaches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">全部教练预约记录</h3>
            <Link
              href="/coach"
              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              + 寻找认证教练
            </Link>
          </div>

          {coachOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-150">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">暂无教练约课记录</p>
              <Link
                href="/coach"
                className="mt-3 inline-block px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
              >
                浏览平台认证教练
              </Link>
            </div>
          ) : (
            coachOrders.map((co) => (
              <div
                key={co.id}
                className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={co.coach_avatar}
                    alt={co.coach_name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{co.coach_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">
                        {co.status === 'confirmed' ? '已确认授课' : '已完成'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{new Date(co.start_time).toLocaleString()} ({co.hours}课时)</span>
                      <span>·</span>
                      <span className="font-bold text-purple-900">实付：¥{(co.amount_cents / 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href="/my/credit"
                    className="px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold transition"
                  >
                    评价教练教学
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: 修改资料表单 */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            编辑球友公开资料
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">球友昵称</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">常住城市</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">常打比赛偏好</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'singles', label: '单打对抗' },
                  { val: 'doubles', label: '双打配合' },
                  { val: 'both', label: '单双打皆可' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, play_preference: opt.val as 'singles' | 'doubles' | 'both' })
                    }
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      formData.play_preference === opt.val
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">个人签名 / 球风介绍</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> 保存中...
                  </>
                ) : (
                  '保存修改'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 互评弹窗 */}
      {reviewMatch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-gray-900 mb-1">球局结束 · 双向互评</h3>
            <p className="text-xs text-gray-500 mb-4">
              对局【{reviewMatch.title}】已完成，评价有助于共同维护高信用网球生态。
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* 星级打分 */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">对局体验与球技打分</label>
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
                  <span className="text-xs font-black text-amber-600 ml-2">{rating} 星</span>
                </div>
              </div>

              {/* 标签选择 */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">球风与履约印象标签</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                          active
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 放鸽子爽约核实 */}
              <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200/80">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNoShow}
                    onChange={(e) => setIsNoShow(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    对方无故爽约未到场 (触发放鸽子扣除 5 分信用)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewMatch(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  暂不评价
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      正在提交...
                    </>
                  ) : (
                    '提交评价并完成闭环'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
