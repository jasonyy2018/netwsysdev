'use client';

import React, { useState } from 'react';
import { VenueDetail, SlotItem } from '@/lib/schemas/court';
import { getCourtSlots, createCourtBooking } from '@/app/(main)/court/actions';
import { MapPin, Star, Calendar, ShieldAlert, CheckCircle2, Loader2, Sparkles, Navigation } from 'lucide-react';

interface CourtBookingClientProps {
  venues: (VenueDetail & { distance_km: number })[];
}

export function CourtBookingClient({ venues }: CourtBookingClientProps) {
  const [selectedVenue, setSelectedVenue] = useState<VenueDetail & { distance_km: number }>(venues[0]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<SlotItem[]>([
    { id: 's-8', court_id: 'c-1', slot_date: selectedDate, start_hour: 8, price_cents: 12000, status: 'available' },
    { id: 's-9', court_id: 'c-1', slot_date: selectedDate, start_hour: 9, price_cents: 12000, status: 'available' },
    { id: 's-10', court_id: 'c-1', slot_date: selectedDate, start_hour: 10, price_cents: 14000, status: 'available' },
    { id: 's-14', court_id: 'c-1', slot_date: selectedDate, start_hour: 14, price_cents: 14000, status: 'available' },
    { id: 's-16', court_id: 'c-1', slot_date: selectedDate, start_hour: 16, price_cents: 16000, status: 'booked' },
    { id: 's-18', court_id: 'c-1', slot_date: selectedDate, start_hour: 18, price_cents: 16000, status: 'available' },
    { id: 's-19', court_id: 'c-1', slot_date: selectedDate, start_hour: 19, price_cents: 16000, status: 'booked' },
    { id: 's-20', court_id: 'c-1', slot_date: selectedDate, start_hour: 20, price_cents: 16000, status: 'available' },
  ]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 切换场馆或日期
  const handleSelectVenue = async (venue: VenueDetail & { distance_km: number }) => {
    setSelectedVenue(venue);
    setSelectedSlotIds([]);
    setErrorMessage('');
    const newSlots = await getCourtSlots(venue.id, selectedDate);
    setSlots(newSlots);
  };

  const handleToggleSlot = (slot: SlotItem) => {
    if (slot.status !== 'available') return;
    setErrorMessage('');
    if (selectedSlotIds.includes(slot.id)) {
      setSelectedSlotIds(selectedSlotIds.filter((id) => id !== selectedSlotIds[0]));
    } else {
      setSelectedSlotIds([...selectedSlotIds, slot.id]);
    }
  };

  // 计算合计金额 (以分计算，显示为元)
  const totalAmountCents = selectedSlotIds.reduce((sum, id) => {
    const s = slots.find((item) => item.id === id);
    return sum + (s?.price_cents || 12000);
  }, 0);

  const handleConfirmBooking = async () => {
    if (selectedSlotIds.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await createCourtBooking({
        court_id: selectedVenue.id,
        court_name: selectedVenue.name,
        slot_ids: selectedSlotIds,
        slot_times: selectedSlotIds.map((id) => {
          const s = slots.find((x) => x.id === id);
          return `${s?.start_hour}:00 - ${Number(s?.start_hour) + 1}:00`;
        }),
        amount_cents: totalAmountCents,
      });

      if (res.success) {
        setBookingSuccess(res.bookingId || 'ORDER-SUCCESS');
      } else {
        setErrorMessage(res.error || '订场失败');
      }
    } catch {
      setErrorMessage('预订请求异常');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 顶部标题栏 */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          场地查询与预订
          <Sparkles className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          直连全城网球场馆，高并发行锁保护，实时防超卖零冲突。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：场馆列表 */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            附近场馆 (按距离排序)
          </div>
          {venues.map((venue) => {
            const isSelected = selectedVenue.id === venue.id;
            return (
              <button
                key={venue.id}
                type="button"
                onClick={() => handleSelectVenue(venue)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {venue.name}
                  </h3>
                  <span className="shrink-0 flex items-center text-xs font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                    {venue.rating}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  <span>距您 {venue.distance_km} km</span>
                  <span className="mx-1">·</span>
                  <span>{venue.courts_count}片标准场</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {venue.facilities.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className="text-xs font-bold text-emerald-800 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span>时段价格</span>
                  <span>¥{(venue.starting_price_cents / 100).toFixed(0)}起 /小时</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 右侧：时段选择与并发防超卖提交 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedVenue.name}</h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedVenue.address}</span>
                </div>
              </div>

              {/* 日期选择器 */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800"
                />
              </div>
            </div>

            {/* 时段状态图例 */}
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-white border border-gray-300" />
                <span>可预订</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-600" />
                <span>已选中</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                <span>已占用 / 锁定</span>
              </div>
            </div>

            {/* 时段网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {slots.map((slot) => {
                const isSelected = selectedSlotIds.includes(slot.id);
                const isBooked = slot.status !== 'available';

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBooked}
                    onClick={() => handleToggleSlot(slot)}
                    className={`p-3.5 rounded-2xl border text-center transition ${
                      isBooked
                        ? 'bg-gray-100/80 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white border-gray-200 text-gray-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-sm font-bold">
                      {slot.start_hour}:00 - {slot.start_hour + 1}:00
                    </div>
                    <div
                      className={`text-xs mt-1 font-semibold ${
                        isSelected ? 'text-emerald-100' : isBooked ? 'text-gray-400' : 'text-emerald-700'
                      }`}
                    >
                      {isBooked ? '已订满' : `¥${(slot.price_cents / 100).toFixed(0)}/小时`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 报错提示 (并发抢占场景) */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 预订成功态 */}
            {bookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-emerald-900">场地预订成功！</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  订单编号: {bookingSuccess} · 模拟支付已完成 · 对应时段已锁定
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccess(null);
                    setSelectedSlotIds([]);
                  }}
                  className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  继续预订其他场地
                </button>
              </div>
            ) : (
              /* 底部结算行动条 */
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">
                    已选 {selectedSlotIds.length} 个时段
                  </div>
                  <div className="text-lg font-black text-gray-900">
                    合计：¥{(totalAmountCents / 100).toFixed(0)}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={selectedSlotIds.length === 0 || isSubmitting}
                  onClick={handleConfirmBooking}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      锁定并支付中...
                    </>
                  ) : (
                    '立即预订 (模拟支付)'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
