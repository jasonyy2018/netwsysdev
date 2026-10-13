'use client';

import React, { useState } from 'react';
import { CoachCard } from '@/lib/schemas/coach';
import { createCoachOrder } from '@/app/(main)/coach/actions';
import { Star, ShieldCheck, Clock, Award, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface CoachClientProps {
  coaches: CoachCard[];
}

export function CoachClient({ coaches }: CoachClientProps) {
  const [selectedCoach, setSelectedCoach] = useState<CoachCard | null>(null);
  const [hours, setHours] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBook = (coach: CoachCard) => {
    setSelectedCoach(coach);
    setErrorMsg('');
    setOrderSuccess(null);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach || !startTime) {
      setErrorMsg('请选择上课时间');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createCoachOrder({
        coach_id: selectedCoach.id,
        coach_name: selectedCoach.nickname,
        start_time: startTime,
        hours,
        price_cents_per_hour: selectedCoach.price_cents_per_hour,
      });

      if (res.success) {
        setOrderSuccess(res.orderId || 'SUCCESS');
      } else {
        setErrorMsg(res.error || '预约失败');
      }
    } catch {
      setErrorMsg('网络请求异常');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 顶部标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          认证网球教练与课程预约
          <Sparkles className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          平台实名与 PTR / ITF 资质严格审核，透明计价，5% 平台保障资金存管。
        </p>
      </div>

      {/* 教练卡片流 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-white rounded-3xl p-6 border border-gray-150 hover:border-emerald-300 transition shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={coach.avatar_url}
                    alt={coach.nickname}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-gray-900">{coach.nickname}</h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        教龄 {coach.years_experience} 年
                      </span>
                      <span>已授 {coach.student_count} 学员</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end text-xs font-black text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-0.5" />
                    {coach.rating}
                  </div>
                  <div className="text-base font-black text-emerald-800 mt-1">
                    ¥{(coach.price_cents_per_hour / 100).toFixed(0)}
                    <span className="text-xs font-normal text-gray-400">/时</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">{coach.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {coach.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-700"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleBook(coach)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              预约私教课程
            </button>
          </div>
        ))}
      </div>

      {/* 预约弹窗 / 抽屉表单 */}
      {selectedCoach && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                预约 {selectedCoach.nickname} 私教课
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCoach(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-base font-bold text-gray-900">预约成功！</h4>
                <p className="text-xs text-gray-500 mt-1">
                  订单号：{orderSuccess} · 教练将主动与您确认具体场地与细节
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCoach(null)}
                  className="mt-6 px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  关闭
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    预约上课时间
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    课程课时数 (小时)
                  </label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHours(h)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                          hours === h
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {h} 小时
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                  <div className="flex justify-between text-gray-500">
                    <span>课时单价</span>
                    <span>¥{(selectedCoach.price_cents_per_hour / 100).toFixed(0)}/小时</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>平台保障服务费 (5%)</span>
                    <span>
                      ¥
                      {(
                        (hours * selectedCoach.price_cents_per_hour * 0.05) /
                        100
                      ).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200 text-sm">
                    <span>应付合计</span>
                    <span className="text-emerald-700">
                      ¥{((hours * selectedCoach.price_cents_per_hour) / 100).toFixed(0)}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在生成订单...
                    </>
                  ) : (
                    '确认预约并付款'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
