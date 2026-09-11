import React from 'react';
import { X, CheckCircle2, AlertTriangle, UserPlus, UserMinus, ArrowRight, KeyRound } from 'lucide-react';
import { ComparisonRow, ComparisonConfig } from '../types';

interface RecordDetailsModalProps {
  record: ComparisonRow | null;
  config: ComparisonConfig;
  onClose: () => void;
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  record,
  config,
  onClose,
}) => {
  if (!record) return null;

  const getStatusBadge = () => {
    switch (record.status) {
      case 'identical':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            مطابق تماماً
          </span>
        );
      case 'modified':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            معدل ({record.changedFields.length} فروقات)
          </span>
        );
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <UserPlus className="w-3.5 h-3.5" />
            سجل جديد مضاف
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <UserMinus className="w-3.5 h-3.5" />
            سجل محذوف / مفقود
          </span>
        );
    }
  };

  // Combine all keys from old and new data
  const allFieldKeys = Array.from(
    new Set([
      ...Object.keys(record.oldData || {}),
      ...Object.keys(record.newData || {}),
    ])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                تفاصيل السجل: <span className="font-mono text-blue-300">{record.key}</span>
              </h3>
              <p className="text-xs text-slate-400">مقارنة الحقول بين الملف المرجع والملف المحدث</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {record.status === 'modified' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>الحقول التي طرأ عليها تعديل:</strong>{' '}
                {record.changedFields.join('، ')}. تم تمييز القيم القديمة والجديدة أدناه.
              </div>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-right divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3 w-1/4">اسم الحقل</th>
                  <th className="p-3 w-3/8 text-slate-600">القيمة السابقة (المرجع)</th>
                  <th className="p-3 w-3/8 text-blue-800">القيمة الجديدة (المحدث)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {allFieldKeys.map((field) => {
                  const isKey = field === config.keyField;
                  const isCompared = config.fieldsToCompare.includes(field);
                  const diff = record.diffs[field];
                  const isChanged = diff?.isDifferent;

                  const oldVal = record.oldData?.[field] ?? '';
                  const newVal = record.newData?.[field] ?? '';

                  return (
                    <tr
                      key={field}
                      className={
                        isChanged
                          ? 'bg-amber-50/70 font-semibold'
                          : isKey
                          ? 'bg-blue-50/30'
                          : ''
                      }
                    >
                      <td className="p-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {isKey && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                              المفتاح
                            </span>
                          )}
                          <span>{field}</span>
                          {isChanged && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                              معدل
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Old Value */}
                      <td className="p-3 text-slate-700 font-mono">
                        {isChanged ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-1 rounded line-through font-bold">
                            {oldVal || '(فارغ)'}
                          </span>
                        ) : (
                          <span>{oldVal || <em className="text-slate-400 font-sans">فارغ</em>}</span>
                        )}
                      </td>

                      {/* New Value */}
                      <td className="p-3 text-slate-900 font-mono">
                        {isChanged ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-black border border-emerald-200">
                            {newVal || '(فارغ)'}
                          </span>
                        ) : (
                          <span>{newVal || <em className="text-slate-400 font-sans">فارغ</em>}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
