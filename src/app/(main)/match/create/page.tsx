'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMatchRequest } from '../actions';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreateMatchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    court_name: '静安网球中心 (常德路馆)',
    city: '上海',
    level_min: 3.0,
    level_max: 4.5,
    start_time: '',
    slots_needed: 1,
    match_type: 'singles',
    cost_mode: 'aa',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.court_name || !formData.start_time) {
      setErrorMsg('请填写完整的标题、场地与开打时间');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await createMatchRequest(formData);
      if (res.success) {
        router.push('/match');
      } else {
        setErrorMsg(res.error || '发布失败');
      }
    } catch {
      setErrorMsg('请求异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/match"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> 返回约球大厅
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            发起约球需求
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            设定球场与等级区间，系统将自动使用推荐算法撮合匹配球友。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              球局标题
            </label>
            <input
              type="text"
              placeholder="例：周末上午静安中心中速对拉与抢七"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                场地名称
              </label>
              <input
                type="text"
                value={formData.court_name}
                onChange={(e) => setFormData({ ...formData, court_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                打球时间
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                比赛形式
              </label>
              <select
                value={formData.match_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    match_type: e.target.value,
                    slots_needed: e.target.value === 'doubles' ? 3 : 1,
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="singles">单打对抗 (找1人)</option>
                <option value="doubles">双打对抗 (找3人)</option>
                <option value="rally">底线对拉 (找1人)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                费用模式
              </label>
              <select
                value={formData.cost_mode}
                onChange={(e) => setFormData({ ...formData, cost_mode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="aa">场地费 AA 平摊</option>
                <option value="creator_pays">发起人全包请客</option>
                <option value="loser_pays">败者买单模式</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                期望最低/最高等级
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="1.0"
                  max="10.0"
                  value={formData.level_min}
                  onChange={(e) => setFormData({ ...formData, level_min: parseFloat(e.target.value) || 2.0 })}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 text-sm text-center"
                />
                <span className="text-gray-400 text-xs">至</span>
                <input
                  type="number"
                  step="0.5"
                  min="1.0"
                  max="10.0"
                  value={formData.level_max}
                  onChange={(e) => setFormData({ ...formData, level_max: parseFloat(e.target.value) || 4.5 })}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 text-sm text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              补充说明 / 球友约定（选填）
            </label>
            <textarea
              rows={3}
              placeholder="例：自带两筒新球，打前热身拉球15分钟，欢迎打球文明、不放鸽子的球友！"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在发布球局...
                </>
              ) : (
                '确认发布并启动智能匹配'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
