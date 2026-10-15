'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitCoachApplication } from '../actions';
import { ArrowLeft, Loader2, Sparkles, CheckCircle2, ShieldCheck, Upload } from 'lucide-react';
import Link from 'next/link';

export default function CoachApplyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    coach_level: 'middle' as 'junior' | 'middle' | 'senior' | 'star',
    years_experience: 3,
    price_yuan_per_hour: 260,
    cert_name: 'PTR 专业级教练认证 (Adult Development)',
    specialties: ['正手上旋进攻', '发球动力链纠错'],
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const allSpecialties = [
    '成人零基础启蒙',
    '正手上旋进攻',
    '单反/双反技术定型',
    '发球动力链纠错',
    '网前截击与高压',
    '比赛战术与心理',
    '少儿青少年进阶',
    '专项步伐与体能',
  ];

  const handleToggleSpecialty = (spec: string) => {
    if (formData.specialties.includes(spec)) {
      setFormData({ ...formData, specialties: formData.specialties.filter((s) => s !== spec) });
    } else {
      setFormData({ ...formData, specialties: [...formData.specialties, spec] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.specialties.length === 0) {
      setErrorMsg('请至少选择一项擅长技术');
      return;
    }
    if (!formData.bio.trim()) {
      setErrorMsg('请填写个人教学履历简介');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await submitCoachApplication(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || '提交失败');
      }
    } catch {
      setErrorMsg('网络请求异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/coach"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> 返回教练大厅
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-sm">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            官方教练认证入驻计划
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            申请成为认证网球教练
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            提交资质后平台将于 1-3 个工作日完成核验，审核通过后即可获得认证徽章并上线接受学员预约。
          </p>
        </div>

        {success ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">入驻申请已提交成功！</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              工作人员正在核验您的资质证书信息。您也可以在运营管理后台（Admin）即时预览和模拟审核通过状态。
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/coach')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
              >
                返回教练列表
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-5 py-2.5 rounded-xl bg-purple-900 text-white text-xs font-bold hover:bg-purple-800 transition"
              >
                前往管理后台查看审核
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">教练等级自评</label>
                <select
                  value={formData.coach_level}
                  onChange={(e) =>
                    setFormData({ ...formData, coach_level: e.target.value as typeof formData.coach_level })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none bg-white"
                >
                  <option value="junior">Junior (初级教练 / 1-3年教龄)</option>
                  <option value="middle">Middle (中级教练 / 3-5年教龄)</option>
                  <option value="senior">Senior (高级教练 / 5年以上实战)</option>
                  <option value="star">Star (明星/专业退役教练)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">教学教龄 (年)</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">期望课时费 (元/小时)</label>
                <input
                  type="number"
                  step={10}
                  min={50}
                  max={2000}
                  value={formData.price_yuan_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_yuan_per_hour: parseInt(e.target.value) || 200 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">认证资质名称</label>
                <input
                  type="text"
                  placeholder="如 PTR / USPTA / ITF / 中国网协教练员"
                  value={formData.cert_name}
                  onChange={(e) => setFormData({ ...formData, cert_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">擅长专项技术 (多选)</label>
              <div className="flex flex-wrap gap-2">
                {allSpecialties.map((spec) => {
                  const active = formData.specialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleToggleSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">资质证书凭证上传 (模拟)</label>
              <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-500 transition text-center cursor-pointer bg-gray-50/50">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <div className="text-xs font-semibold text-gray-700">点击上传教练资格证书扫描件 / 照片</div>
                <div className="text-[11px] text-gray-400 mt-0.5">支持 JPG, PNG, PDF 格式，文件大小不超过 5MB</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">教学简介与个人履历</label>
              <textarea
                rows={3}
                placeholder="请详细介绍您的打球背景、教学年限、受教风格以及希望带给学员的改变..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提交审核中...
                </>
              ) : (
                '提交入驻申请 (免费)'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
