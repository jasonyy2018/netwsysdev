'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithPhone, loginWithPassword, sendSmsCode } from '../actions';
import { Phone, Lock, ShieldCheck, Loader2, ArrowRight, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const [loginMode, setLoginMode] = useState<'phone' | 'password'>('password');
  
  // 密码登录
  const [account, setAccount] = useState('13812345678');
  const [password, setPassword] = useState('123456');

  // 短信登录
  const [phone, setPhone] = useState('13812345678');
  const [code, setCode] = useState('888888');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tipMsg, setTipMsg] = useState('');

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }
    setErrorMsg('');
    setSending(true);

    try {
      const res = await sendSmsCode({ phone, scene: 'login' });
      if (res.success) {
        setTipMsg(`验证码发送成功！开发测试码: ${res.mockCode || '888888'}`);
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginWithPassword({ account, password });
      if (res.success) {
        router.push(redirectTarget);
        router.refresh();
      } else {
        setErrorMsg(res.error || '登录失败');
      }
    } catch {
      setErrorMsg('网络异常');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginWithPhone({ phone, code });
      if (res.success) {
        router.push(redirectTarget);
        router.refresh();
      } else {
        setErrorMsg(res.error || '登录失败');
      }
    } catch {
      setErrorMsg('网络异常');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-150 shadow-sm">
        {/* 头部 */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            🎾
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">球友账号登录</h1>
          <p className="text-xs text-gray-500 mt-1">
            登录后即可发起约球、参与球局、在线抢场与预约私教
          </p>
        </div>

        {/* 登录重定向提示 */}
        {redirectTarget !== '/' && (
          <div className="mb-5 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>您访问的功能需要先登录账号，登录后将自动返回继续操作。</span>
          </div>
        )}

        {/* 登录方式切换 Tab */}
        <div className="flex border-b border-gray-150 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setErrorMsg('');
            }}
            className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition ${
              loginMode === 'password'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            密码登录
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('phone');
              setErrorMsg('');
            }}
            className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition ${
              loginMode === 'phone'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            手机短信验证码登录
          </button>
        </div>

        {tipMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {tipMsg}
          </div>
        )}

        {/* 方式1: 账号密码登录 */}
        {loginMode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">手机号 / 账号</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="请输入手机号或账号"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">登录密码</label>
                <span className="text-[11px] text-gray-400">默认密码：123456</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
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
                  验证登录中...
                </>
              ) : (
                <>
                  登录系统
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* 方式2: 手机短信验证码登录 */
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">手机号</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="请输入11位中国大陆手机号"
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
                    placeholder="6位验证码"
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
                支持第三方短信接入；测试环境快捷码：<span className="font-bold text-emerald-600">888888</span>
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
                  验证登录中...
                </>
              ) : (
                <>
                  登录系统
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 底部跳转注册 */}
        <div className="mt-6 pt-6 border-t border-gray-150 flex items-center justify-between text-xs">
          <span className="text-gray-500">还没有 TennisHub 账号？</span>
          <Link
            href={`/register${redirectTarget !== '/' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            免费注册账号 <Sparkles className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
