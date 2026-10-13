import React from 'react';
import { Loader2 } from 'lucide-react';

export default function MatchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
      <h3 className="text-base font-bold text-gray-900 mb-1">正在加载同城约球需求...</h3>
      <p className="text-xs text-gray-500">正在与数据库计算匹配状态</p>
    </div>
  );
}
