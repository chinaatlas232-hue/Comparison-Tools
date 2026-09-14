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
    <div className="bg-gradient-to-br from-violet-200 via-fuchsia-100 to-sky-100 text-violet-950 rounded-2xl p-5 sm:p-6 shadow-sm border border-violet-200/80 flex flex-col justify-between h-full">
      <div>
        {/* Pill on Top */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 text-violet-700 border border-violet-200 mb-3">
          <span>ما هو المطلوب للمقارنة؟</span>
          <span className="text-violet-900 font-bold">[الكود، رقم الهاتف، العنوان]</span>
        </div>

        {/* Title */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-violet-950 mb-2 leading-tight">
          أداة مقارنة الملفات وتحديد الفروقات التلقائية
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-sm text-violet-800/80 leading-relaxed">
          <span className="text-fuchsia-700 font-bold">المطلوب ببساطة:</span>{' '}
          1) رفع الملفين القديم والجديد (Excel/CSV).{' '}
          2) اختيار عمود الربط (مثل الكود).{' '}
          3) اختيار الحقول المراد فحصها (مثل الهاتف والعنوان).
        </p>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 mt-3 border-t border-violet-200/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            id="btn-load-demo"
            type="button"
            onClick={onLoadDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-violet-400 hover:bg-violet-500 active:bg-violet-600 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-100" />
            <span>تجربة بيانات نموذجية</span>
          </button>

          {hasData && (
            <button
              id="btn-reset-data"
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/70 hover:bg-white text-violet-700 border border-violet-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>تفريغ الملفات</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-violet-700/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>خصوصية تامة 100% في المتصفح</span>
        </div>
      </div>
    </div>
  );
};
