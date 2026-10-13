import React from 'react';
import { Loader2 } from 'lucide-react';

export default function CoachLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
      <h3 className="text-base font-bold text-gray-900 mb-1">正在加载认证教练档案与时段...</h3>
      <p className="text-xs text-gray-500">正在核验资质与预约排期</p>
    </div>
  );
}
