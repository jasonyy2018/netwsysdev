'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithPhone } from '../actions';
import { Phone, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('13800138000');
  const [code, setCode] = useState('888888');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }
    setErrorMsg('');
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginWithPhone({ phone, code });
      if (res.success) {
        router.push('/my/profile');
      } else {
        setErrorMsg(res.error || '登录失败');
      }
    } catch {
      setErrorMsg('网络请求异常，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-150 shadow-sm">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            🎾
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">手机号快捷登录 / 注册</h1>
          <p className="text-xs text-gray-500 mt-1">
            新用户初次登录自动注册，即刻同步 T1-T10 测评与同城约球
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">手机号码</label>
            <div className="relative">
              <input
                type="tel"
                maxLength={11}
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">短信验证码</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="请输入6位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none tracking-widest font-mono"
                  required
                />
                <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>

              <button
                type="button"
                disabled={countdown > 0 || sending}
                onClick={handleSendCode}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-500 text-xs font-bold text-gray-700 hover:text-emerald-700 transition disabled:opacity-50 shrink-0"
              >
                {sending ? '发送中...' : countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </button>
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              测试模式已预填免验证短信（测试验证码：<span className="font-bold text-emerald-600">888888</span> 或 <span className="font-bold text-emerald-600">123456</span>）
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                登录中...
              </>
            ) : (
              <>
                进入 TennisHub
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-800 font-medium">
            ← 返回首页浏览
          </Link>
        </div>
      </div>
    </div>
  );
}
