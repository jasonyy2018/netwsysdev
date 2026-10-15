'use client';

import React, { useState } from 'react';
import { AdminStats, AdminUserItem, AdminCoachAuditItem, AdminOrderItem, toggleCoachVerification } from '@/app/(admin)/admin/actions';
import { Users, UserCheck, Calendar, DollarSign, ShieldCheck, CheckCircle2, XCircle, Search, Sparkles, Filter, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AdminDashboardClientProps {
  stats: AdminStats;
  initialUsers: AdminUserItem[];
  initialCoaches: AdminCoachAuditItem[];
  orders: AdminOrderItem[];
}

export function AdminDashboardClient({
  stats,
  initialUsers,
  initialCoaches,
  orders,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'coaches' | 'orders'>('overview');
  const [coaches, setCoaches] = useState<AdminCoachAuditItem[]>(initialCoaches);
  const [users] = useState<AdminUserItem[]>(initialUsers);
  const [searchUser, setSearchUser] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleVerifyCoach = async (coachId: string, verified: boolean) => {
    try {
      const res = await toggleCoachVerification(coachId, verified);
      if (res.success) {
        setCoaches((prev) =>
          prev.map((c) => (c.id === coachId ? { ...c, verified } : c))
        );
        setActionSuccess(`已成功${verified ? '批准' : '取消'}该教练的平台入驻资格`);
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch {
      //
    }
  };

  const filteredUsers = users.filter((u) =>
    u.nickname.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.phone.includes(searchUser) ||
    u.city.includes(searchUser)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 顶部标题与快速入口 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800">
              TennisHub 运营管理后台
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1 flex items-center gap-2">
            平台综合管控与数据看板
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            全景监控平台注册用户、教练入驻资质审核、场地订单流转与信用风控。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            返回前台大厅
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 核心统计指标卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">注册球友数</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.userCount} 人</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">日活增长 +14%</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">约球撮合对局</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.matchCount} 场</div>
          <div className="text-[11px] text-gray-400 mt-1">成行率 86.4%</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">场地订场总数</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.bookingCount} 单</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">并发零超卖</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">累计交易流水</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            ¥{(stats.revenueCents / 100).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">含 5% 平台服务费存管</div>
        </div>
      </div>

      {/* 后台导航 Tab 切换 */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { key: 'overview', label: '运营总览' },
          { key: 'users', label: '用户管理与信用' },
          { key: 'coaches', label: '教练入驻资质审核' },
          { key: 'orders', label: '订场订单明细' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 运营总览面板 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>待处理教练入驻申请</span>
              <span className="text-xs text-amber-600 font-medium">
                {coaches.filter((c) => !c.verified).length} 位待审核
              </span>
            </h3>
            <div className="space-y-3">
              {coaches.filter((c) => !c.verified).length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">所有入驻教练均已审核完毕 🎉</div>
              ) : (
                coaches
                  .filter((c) => !c.verified)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-gray-900">{c.nickname}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          教龄 {c.years_experience}年 · 期望时薪 ¥{(c.price_cents_per_hour / 100).toFixed(0)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVerifyCoach(c.id, true)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                      >
                        批准通过
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>最新场地交易订单</span>
              <span className="text-xs text-gray-400">实时状态</span>
            </h3>
            <div className="space-y-3">
              {orders.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-gray-900">{ord.court_name}</div>
                    <div className="text-gray-400 mt-0.5">下单人: {ord.user_nickname}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-800">
                      ¥{(ord.amount_cents / 100).toFixed(0)}
                    </div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                      {ord.status === 'mock_paid' ? '已支付' : ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. 用户管理面板 */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="text-base font-bold text-gray-900">平台注册用户与信用档案</h3>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="搜索昵称/手机号/城市"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-purple-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-y border-gray-100">
                <tr>
                  <th className="py-3 px-4">用户昵称</th>
                  <th className="py-3 px-4">手机号</th>
                  <th className="py-3 px-4">城市</th>
                  <th className="py-3 px-4">测评等级</th>
                  <th className="py-3 px-4">信用分</th>
                  <th className="py-3 px-4">系统角色</th>
                  <th className="py-3 px-4">注册时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{u.nickname}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono">{u.phone}</td>
                    <td className="py-3.5 px-4 text-gray-600">{u.city}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-black text-amber-800 bg-amber-50 border border-amber-200">
                        T{u.level_num.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          u.credit_score >= 80 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {u.credit_score}分
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {u.role === 'admin' ? '管理员' : '球友'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. 教练资质审核面板 */}
      {activeTab === 'coaches' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-6">入驻教练与资质认证列表</h3>
          <div className="space-y-4">
            {coaches.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-gray-150 hover:border-purple-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">{c.nickname}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800">
                      {c.coach_level.toUpperCase()} 等级
                    </span>
                    {c.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 已认证上架
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        待审核
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    教龄 {c.years_experience} 年 · 课时单价 ¥{(c.price_cents_per_hour / 100).toFixed(0)}/小时 · 学员评分 {c.rating}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 max-w-2xl bg-gray-50 p-2.5 rounded-xl">
                    “{c.bio}”
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.verified ? (
                    <button
                      type="button"
                      onClick={() => handleVerifyCoach(c.id, false)}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
                    >
                      下架停权
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleVerifyCoach(c.id, true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      通过审核并上架
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 订场订单明细 */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-6">全网场地预订交易流水</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-y border-gray-100">
                <tr>
                  <th className="py-3 px-4">订单号</th>
                  <th className="py-3 px-4">预订场地</th>
                  <th className="py-3 px-4">球友昵称</th>
                  <th className="py-3 px-4">实付金额</th>
                  <th className="py-3 px-4">交易状态</th>
                  <th className="py-3 px-4">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">{ord.id}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{ord.court_name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{ord.user_nickname}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ¥{(ord.amount_cents / 100).toFixed(0)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ord.status === 'mock_paid' ? '支付成功' : ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(ord.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
