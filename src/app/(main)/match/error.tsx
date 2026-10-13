'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function MatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">约球模块发生异常</h2>
      <p className="text-xs text-gray-500 mb-6">{error.message || '加载约球数据出错'}</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
      >
        重试
      </button>
    </div>
  );
}
