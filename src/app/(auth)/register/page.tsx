'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, sendSmsCode } from '../actions';
import { Phone, Lock, User, MapPin, ShieldCheck, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    city: '上海',
    code: '',
  });

  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tipMsg, setTipMsg] = useState('');

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }
    setErrorMsg('');
    setSending(true);

    try {
      const res = await sendSmsCode({ phone: formData.phone, scene: 'register' });
      if (res.success) {
        setTipMsg(`验证码已发送！测试环境可用: ${res.mockCode || '888888'}`);
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
      } else {
        setErrorMsg(res.error || '发送失败');
      }
    } catch {
      setErrorMsg('网络请求异常');
    } finally {
      setSending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('密码长度不能少于 6 位');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await registerUser({
        phone: formData.phone,
        password: formData.password,
        nickname: formData.nickname,
        city: formData.city,
        code: formData.code,
      });

      if (res.success) {
        router.push('/');
        router.refresh();
      } else {
        setErrorMsg(res.error || '注册失败');
      }
    } catch {
      setErrorMsg('网络请求异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-150 shadow-sm">
        {/* 头部 */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            🎾
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
            新球友注册
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            加入 TennisHub 社区，开启网球等级测评与智能约球
          </p>
        </div>

        {tipMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {tipMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">球友昵称</label>
            <div className="relative">
              <input
                type="text"
                placeholder="例: 网球少年、小威正手"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                required
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">常住城市</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="如: 上海、北京"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">手机号码</label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="11位手机号"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">短信验证码</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6位短信码"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
              测试验证码：<span className="font-bold text-emerald-600">888888</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">设置登录密码</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="至少6位密码"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">确认密码</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="再次确认"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
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
                正在注册账号...
              </>
            ) : (
              <>
                确认注册并登录
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-150 flex items-center justify-between text-xs">
          <span className="text-gray-500">已有账号？</span>
          <Link
            href="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700"
          >
            直接登录 →
          </Link>
        </div>
      </div>
    </div>
  );
}
