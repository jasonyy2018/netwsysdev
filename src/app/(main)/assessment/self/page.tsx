'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ASSESSMENT_QUESTIONS } from '@/lib/schemas/assessment';
import { submitSelfAssessment } from '../actions';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function AssessmentSelfPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2, 3 (共4屏，每屏3题)
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalSteps = 4;
  const questionsPerStep = 3;
  const startIndex = currentStep * questionsPerStep;
  const currentQuestions = ASSESSMENT_QUESTIONS.slice(startIndex, startIndex + questionsPerStep);

  const handleSelectOption = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isCurrentStepComplete = currentQuestions.every((q) => !!answers[q.id]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await submitSelfAssessment(answers);
      if (res.success) {
        router.push('/assessment/result');
      } else {
        setErrorMessage(res.error || '提交遇到问题，请检查问卷答案');
      }
    } catch {
      setErrorMessage('网络请求异常，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round(((Object.keys(answers).length) / ASSESSMENT_QUESTIONS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 顶部进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
          <span>
            阶段 {currentStep + 1} / {totalSteps}
          </span>
          <span className="text-emerald-600 font-bold">{progressPercent}% 已完成</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          网球水平测评问卷
          <Sparkles className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          客观选择您近期的击球常态，系统将计算您的 T1-T10 阶梯等级与六维雷达图。
        </p>
      </div>

      {/* 题目列表 */}
      <div className="space-y-8">
        {currentQuestions.map((q, qIndex) => {
          const selectedValue = answers[q.id];
          return (
            <div key={q.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700">
                  {q.category}
                </span>
                <span className="text-xs text-gray-400 font-medium">第 {startIndex + qIndex + 1} 题</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-4">{q.title}</h3>

              <div className="space-y-2.5">
                {q.options.map((opt) => {
                  const isChecked = selectedValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.value)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-semibold ${isChecked ? 'text-emerald-900' : 'text-gray-900'}`}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                      </div>
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* 底部导航按钮 */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> 上一步
          </button>
        ) : (
          <div />
        )}

        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            disabled={!isCurrentStepComplete}
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
              isCurrentStepComplete
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            下一步 ({currentStep + 1}/{totalSteps}) <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!isCurrentStepComplete || isSubmitting}
            onClick={handleSubmit}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
              isCurrentStepComplete && !isSubmitting
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> 计算评分中...
              </>
            ) : (
              '生成我的等级报告'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
