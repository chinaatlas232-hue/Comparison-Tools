import React from 'react';
import { FileSpreadsheet, Sparkles, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onLoadDemo: () => void;
  onReset: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadDemo, onReset, hasData }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Title & Pill */}
          <div>
            <div className="flex items-center flex-wrap gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                أداة مقارنة الملفات وتحديد الفروقات التلقائية
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <span>ما هو المطلوب للمقارنة؟</span>
                <span className="text-white font-black">[الكود، رقم الهاتف، العنوان]</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              <span className="font-semibold text-blue-300">المطلوب ببساطة:</span> 
              {' '}1) رفع الملفين القديم والجديد (Excel/CSV). 
              {' '}2) اختيار عمود الربط الأساسي (مثل الكود). 
              {' '}3) اختيار الحقول المراد فحصها (مثل الهاتف والعنوان والحالة).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              id="btn-load-demo"
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
              title="تحميل ملفات تجريبية مطابقة لمعاينة عمل الأداة فوراً"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>تجربة بيانات توضيحية</span>
            </button>
            {hasData && (
              <button
                id="btn-reset-data"
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title="تفريغ البيانات والبدء من جديد"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
