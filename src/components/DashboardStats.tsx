import React from 'react';
import { CheckCircle2, AlertTriangle, UserPlus, UserMinus, KeyRound } from 'lucide-react';
import { ComparisonStats } from '../types';

interface DashboardStatsProps {
  stats: ComparisonStats;
  selectedStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  selectedFieldFilter: string | null;
  onSelectFieldFilter: (field: string | null) => void;
  keyField: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  selectedStatusFilter,
  onSelectStatusFilter,
  selectedFieldFilter,
  onSelectFieldFilter,
  keyField,
}) => {
  const total = stats.totalUniqueKeys || 1;

  const getPercent = (count: number) => {
    return Math.round((count / total) * 100);
  };

  const identicalPct = (stats.identicalCount / total) * 100;
  const modifiedPct = (stats.modifiedCount / total) * 100;
  const addedPct = (stats.addedCount / total) * 100;
  const deletedPct = (stats.deletedCount / total) * 100;

  return (
    <div className="space-y-4 mb-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-black flex items-center justify-center border border-violet-200">
          3
        </span>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          لوحة التحكم ونتائج المقارنة (Dashboard)
        </h2>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Identical */}
        <div
          onClick={() =>
            onSelectStatusFilter(selectedStatusFilter === 'identical' ? 'all' : 'identical')
          }
          className={`rounded-2xl border p-4 bg-emerald-50/70 transition-all cursor-pointer select-none hover:shadow-sm ${
            selectedStatusFilter === 'identical'
              ? 'ring-2 ring-emerald-300 border-emerald-300 shadow-sm'
              : 'border-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">مطابقة تماماً</h3>
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.identicalCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-500">
              ({getPercent(stats.identicalCount)}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">سجلات بلا أي اختلافات</p>
        </div>

        {/* Card 2: Modified */}
        <div
          onClick={() =>
            onSelectStatusFilter(selectedStatusFilter === 'modified' ? 'all' : 'modified')
          }
          className={`rounded-2xl border p-4 bg-amber-50/80 transition-all cursor-pointer select-none hover:shadow-sm ${
            selectedStatusFilter === 'modified'
              ? 'ring-2 ring-amber-300 border-amber-300 shadow-sm'
              : 'border-amber-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">سجلات معدلة (فروقات)</h3>
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.modifiedCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-500">
              ({getPercent(stats.modifiedCount)}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">تغير في الهاتف، العنوان، إلخ</p>
        </div>

        {/* Card 3: Added */}
        <div
          onClick={() =>
            onSelectStatusFilter(selectedStatusFilter === 'added' ? 'all' : 'added')
          }
          className={`rounded-2xl border p-4 bg-sky-50/80 transition-all cursor-pointer select-none hover:shadow-sm ${
            selectedStatusFilter === 'added'
              ? 'ring-2 ring-sky-300 border-sky-300 shadow-sm'
              : 'border-sky-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">سجلات مضافة (جديدة)</h3>
            <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.addedCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-sky-500">
              ({getPercent(stats.addedCount)}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">موجودة بالملف الجديد فقط</p>
        </div>

        {/* Card 4: Deleted */}
        <div
          onClick={() =>
            onSelectStatusFilter(selectedStatusFilter === 'deleted' ? 'all' : 'deleted')
          }
          className={`rounded-2xl border p-4 bg-rose-50/80 transition-all cursor-pointer select-none hover:shadow-sm ${
            selectedStatusFilter === 'deleted'
              ? 'ring-2 ring-rose-300 border-rose-300 shadow-sm'
              : 'border-rose-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">سجلات محذوفة (مفقودة)</h3>
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-400 flex items-center justify-center shrink-0">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.deletedCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-rose-400">
              ({getPercent(stats.deletedCount)}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">حذفت من الملف الجديد</p>
        </div>
      </div>

      {/* Distribution of Differences Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              توزيع الفروقات حسب الحقول (الهاتف، العنوان، الأكواد...)
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-md">
              <KeyRound className="w-3 h-3" />
              {keyField} (مفتاح الربط)
            </span>
          </div>

          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
            {getPercent(stats.identicalCount)}% تطابق
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full bg-violet-50 rounded-full overflow-hidden flex shadow-inner mb-2.5">
          {identicalPct > 0 && (
            <div
              style={{ width: `${identicalPct}%` }}
              className="bg-emerald-300 h-full transition-all"
              title={`مطابق: ${stats.identicalCount}`}
            />
          )}
          {modifiedPct > 0 && (
            <div
              style={{ width: `${Math.max(modifiedPct, 1)}%` }}
              className="bg-amber-300 h-full transition-all"
              title={`معدل: ${stats.modifiedCount}`}
            />
          )}
          {addedPct > 0 && (
            <div
              style={{ width: `${addedPct}%` }}
              className="bg-sky-300 h-full transition-all"
              title={`مضاف: ${stats.addedCount}`}
            />
          )}
          {deletedPct > 0 && (
            <div
              style={{ width: `${deletedPct}%` }}
              className="bg-rose-300 h-full transition-all"
              title={`محذوف: ${stats.deletedCount}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span>
            <span>مطابق ({stats.identicalCount.toLocaleString()})</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
            <span>معدل ({stats.modifiedCount.toLocaleString()})</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-300"></span>
            <span>مضاف ({stats.addedCount.toLocaleString()})</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span>
            <span>محذوف ({stats.deletedCount.toLocaleString()})</span>
          </div>
        </div>

        {/* Changes per Field Pills */}
        <div>
          <p className="text-xs text-slate-500 mb-2">
            عدد السجلات التي تغيرت في كل حقل (انقر للفلترة السريعة):
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {Object.keys(stats.fieldDiffCounts || {}).length === 0 ? (
              <span className="text-xs text-slate-400">لا توجد حقول محددة للمقارنة</span>
            ) : (
              Object.entries(stats.fieldDiffCounts || {}).map(([field, count]) => {
                const isSelected = selectedFieldFilter === field;
                const numCount = Number(count) || 0;
                const hasDiff = numCount > 0;

                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => onSelectFieldFilter(isSelected ? null : field)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-300 text-amber-950 font-bold border-amber-300 shadow-sm'
                        : hasDiff
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 font-bold'
                        : 'bg-violet-50 hover:bg-violet-100 text-slate-700 border-violet-100'
                    }`}
                  >
                    <span>{field}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-white/50 text-amber-900'
                          : hasDiff
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      {numCount} تغيير
                    </span>
                  </button>
                );
              })
            )}

            {selectedFieldFilter && (
              <button
                type="button"
                onClick={() => onSelectFieldFilter(null)}
                className="text-xs text-violet-600 hover:text-violet-800 font-bold underline px-2 cursor-pointer"
              >
                إلغاء فلترة الحقل
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
