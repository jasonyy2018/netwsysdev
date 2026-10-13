'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UploadCloud, CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';

interface StrokeVideo {
  type: 'forehand' | 'backhand' | 'serve';
  title: string;
  desc: string;
  file: File | null;
  status: 'idle' | 'uploading' | 'analyzing' | 'done';
}

export default function AssessmentVideoPage() {
  const [strokes, setStrokes] = useState<StrokeVideo[]>([
    {
      type: 'forehand',
      title: '正手击球视频',
      desc: '请拍摄底线连续击打 3-5 拍完整动作，机位建议在斜后方 45 度。限制 20MB / 15 秒。',
      file: null,
      status: 'idle',
    },
    {
      type: 'backhand',
      title: '反手击球视频',
      desc: '单反/双反均可，展示完整的动力链引拍、击球点与随挥动作。',
      file: null,
      status: 'idle',
    },
    {
      type: 'serve',
      title: '发球动作视频',
      desc: '从抛球到击球点再到收拍，侧面或后方视角最佳。',
      file: null,
      status: 'idle',
    },
  ]);

  const [analyzingGlobal, setAnalyzingGlobal] = useState(false);

  const handleSimulateUpload = (index: number) => {
    setStrokes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status: 'uploading' };
      return copy;
    });

    setTimeout(() => {
      setStrokes((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], status: 'done' };
        return copy;
      });
    }, 1500);
  };

  const handleStartAnalysis = () => {
    setAnalyzingGlobal(true);
    setTimeout(() => {
      setAnalyzingGlobal(false);
      window.location.href = '/assessment/result';
    }, 3000);
  };

  const allUploaded = strokes.some((s) => s.status === 'done');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          AI 视频多模态技术评级
          <Sparkles className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          基于高频抽帧（每 0.5 秒提取一帧）多模态技术分析，自动量化正手、反手与发球动力链特征。
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {strokes.map((stroke, index) => (
          <div key={stroke.type} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{stroke.title}</span>
                {stroke.status === 'done' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 上传就绪
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 max-w-md">{stroke.desc}</p>
            </div>

            <div className="shrink-0">
              {stroke.status === 'idle' && (
                <button
                  type="button"
                  onClick={() => handleSimulateUpload(index)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition"
                >
                  <UploadCloud className="w-4 h-4 text-gray-500" /> 选择并上传
                </button>
              )}
              {stroke.status === 'uploading' && (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-semibold">
                  <Clock className="w-4 h-4 animate-spin text-emerald-600" /> 上传压缩中...
                </div>
              )}
              {stroke.status === 'done' && (
                <button
                  type="button"
                  onClick={() => handleSimulateUpload(index)}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  重新选择
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {analyzingGlobal ? (
        <div className="bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">AI 视觉分析引擎正在抽帧计算...</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            正在识别引拍幅度、击球点高度、随挥轨迹与重心转移速度，即将合成六维雷达。
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/assessment/result"
            className="text-xs font-semibold text-gray-500 hover:text-gray-800"
          >
            跳过视频，先查看问卷评级
          </Link>

          <button
            type="button"
            disabled={!allUploaded}
            onClick={handleStartAnalysis}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
              allUploaded
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            开始 AI 智能分析 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
