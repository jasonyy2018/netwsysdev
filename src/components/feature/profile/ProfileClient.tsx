'use client';

import React, { useState } from 'react';
import { UserSession } from '@/lib/schemas/auth';
import { updateProfile, logout } from '@/app/(auth)/actions';
import { User, Phone, MapPin, Award, Shield, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ProfileClientProps {
  user: UserSession;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [formData, setFormData] = useState({
    nickname: user.nickname,
    city: user.city,
    play_preference: user.play_preference,
    bio: '业余网球狂热爱好者，周末必拉球，平时有空单打切磋。',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
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

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 顶部标题与退出 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">个人中心与球友档案</h1>
          <p className="text-xs text-gray-500 mt-1">管理您的网球段位、联系方式与出拍喜好</p>
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
            <div className="flex items-center gap-2">
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
            className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center flex-1 sm:flex-none min-w-[90px]"
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
            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex-1 sm:flex-none min-w-[90px]"
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

      {/* 修改资料表单 */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          编辑球友公开资料
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
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
    </div>
  );
}
