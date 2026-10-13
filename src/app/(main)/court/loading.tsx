import React from 'react';
import { Loader2 } from 'lucide-react';

export default function CourtLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
      <h3 className="text-base font-bold text-gray-900 mb-1">正在加载附近网球场馆与可预约时段...</h3>
      <p className="text-xs text-gray-500">正在实时同步防超卖数据</p>
    </div>
  );
}
