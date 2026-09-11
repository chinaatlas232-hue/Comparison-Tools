import React from 'react';
import { Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderBannerProps {
  onLoadDemo: () => void;
  onReset: () => void;
  hasData: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  onLoadDemo,
  onReset,
  hasData,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col justify-between h-full">
      <div>
        {/* Pill on Top */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10 mb-3">
          <span>ما هو المطلوب للمقارنة؟</span>
          <span className="text-white font-bold">[الكود، رقم الهاتف، العنوان]</span>
        </div>

        {/* Title */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white mb-2 leading-tight">
          أداة مقارنة الملفات وتحديد الفروقات التلقائية
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <span className="text-blue-300 font-bold">المطلوب ببساطة:</span>{' '}
          1) رفع الملفين القديم والجديد (Excel/CSV).{' '}
          2) اختيار عمود الربط (مثل الكود).{' '}
          3) اختيار الحقول المراد فحصها (مثل الهاتف والعنوان).
        </p>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            id="btn-load-demo"
            type="button"
            onClick={onLoadDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>تجربة بيانات نموذجية (14,510 سجل)</span>
          </button>

          {hasData && (
            <button
              id="btn-reset-data"
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>تفريغ الملفات</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>خصوصية تامة 100% في المتصفح</span>
        </div>
      </div>
    </div>
  );
};
