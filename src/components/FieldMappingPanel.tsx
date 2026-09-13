import React from 'react';
import { KeyRound, SlidersHorizontal, CheckCircle2, Check } from 'lucide-react';
import { ComparisonConfig } from '../types';

interface FieldMappingPanelProps {
  availableColumns: string[];
  config: ComparisonConfig;
  onConfigChange: React.Dispatch<React.SetStateAction<ComparisonConfig>>;
}

export const FieldMappingPanel: React.FC<FieldMappingPanelProps> = ({
  availableColumns,
  config,
  onConfigChange,
}) => {
  const handleKeySelect = (col: string) => {
    onConfigChange((prev) => ({
      ...prev,
      keyField: col,
      // Remove the selected key from fields to compare if present
      fieldsToCompare: prev.fieldsToCompare.filter((f) => f !== col),
    }));
  };

  const toggleField = (col: string) => {
    onConfigChange((prev) => {
      const exists = prev.fieldsToCompare.includes(col);
      return {
        ...prev,
        fieldsToCompare: exists
          ? prev.fieldsToCompare.filter((f) => f !== col)
          : [...prev.fieldsToCompare, col],
      };
    });
  };

  const selectAllFields = () => {
    onConfigChange((prev) => ({
      ...prev,
      fieldsToCompare: availableColumns.filter((c) => c !== prev.keyField),
    }));
  };

  const clearAllFields = () => {
    onConfigChange((prev) => ({
      ...prev,
      fieldsToCompare: [],
    }));
  };

  return (
    <aside className="space-y-4 w-full">
      {/* 2.1 Primary Key Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-black flex items-center justify-center border border-blue-100">
            2
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            المفتاح الأساسي المشترك (الكود / المعرّف)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3.5 mr-8">
          عمود لمنع ربط نفس السجل بين الملفين ولا يتكرر
        </p>

        {/* Column List for Key Selection */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {availableColumns.map((col) => {
            const isSelected = config.keyField === col;
            return (
              <button
                key={col}
                type="button"
                onClick={() => handleKeySelect(col)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <KeyRound className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{col}</span>
                </div>
                {isSelected ? (
                  <span className="shrink-0 text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    المفتاح المختار
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded">
                    مفتاح
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.2 Fields to Compare Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-black flex items-center justify-center border border-blue-100">
              ✓
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              الحقول المراد فحص الفروقات بها (الهاتف، العنوان...)
            </h3>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3 mr-8">
          اختر الأعمدة التي تريد للتطبيق أن يكتشف أي تعديل فيها
        </p>

        {/* Quick buttons */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 text-xs">
          <span className="text-slate-500 text-[11px]">
            المحدد: <strong className="text-slate-800">{config.fieldsToCompare.length}</strong> من {availableColumns.length}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={selectAllFields}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-[11px]"
            >
              تحديد الكل
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={clearAllFields}
              className="text-slate-500 hover:text-slate-700 font-medium hover:underline text-[11px]"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>

        {/* Field Checkboxes */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {availableColumns.map((col) => {
            const isKey = config.keyField === col;
            const isChecked = config.fieldsToCompare.includes(col);

            return (
              <label
                key={col}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                  isChecked
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                    : isKey
                    ? 'bg-slate-50/50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isKey}
                    onChange={() => toggleField(col)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="truncate">{col}</span>
                </div>

                {isChecked && (
                  <span className="shrink-0 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    مفحوص
                  </span>
                )}
                {isKey && (
                  <span className="shrink-0 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                    مفتاح ربط
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* 2.3 Options & Normalization Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
            خيارات المعالجة الذكية
          </h4>
        </div>

        <div className="space-y-2 text-xs text-slate-700 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={config.normalizePhones}
              onChange={(e) =>
                onConfigChange((prev) => ({ ...prev, normalizePhones: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>توحيد صياغة أرقام الهواتف (07... / 964...)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={config.normalizeArabic}
              onChange={(e) =>
                onConfigChange((prev) => ({ ...prev, normalizeArabic: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>تطبيع الحروف العربية (أ، إ، آ، ة، ى)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={config.ignoreWhitespace}
              onChange={(e) =>
                onConfigChange((prev) => ({ ...prev, ignoreWhitespace: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>تجاهل المسافات الزائدة في البداية والنهاية</span>
          </label>
        </div>
      </div>
    </aside>
  );
};
