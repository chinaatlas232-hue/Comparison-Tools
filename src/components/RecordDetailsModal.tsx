import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, UserPlus, UserMinus, KeyRound } from 'lucide-react';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const getStatusBadge = () => {
    switch (record.status) {
      case 'identical':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            مطابق تماماً
          </span>
        );
      case 'modified':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            معدل ({record.changedFields.length} فروقات)
          </span>
        );
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <UserPlus className="w-3.5 h-3.5" />
            سجل جديد مضاف
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-violet-950/30 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-violet-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-l from-violet-200 via-fuchsia-100 to-sky-100 text-violet-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-400 flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                تفاصيل السجل: <span className="font-mono text-violet-700">{record.key}</span>
              </h3>
              <p className="text-xs text-violet-700/70">مقارنة الحقول بين الملف المرجع والملف المحدث</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/60 text-violet-500 hover:text-violet-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {record.status === 'modified' && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>الحقول التي طرأ عليها تعديل:</strong>{' '}
                {record.changedFields.join('، ')}. تم تمييز القيم القديمة والجديدة أدناه.
              </div>
            </div>
          )}

          <div className="border border-violet-100 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-right divide-y divide-violet-100">
              <thead className="bg-violet-50 text-violet-800 font-bold">
                <tr>
                  <th className="p-3 w-1/4">اسم الحقل</th>
                  <th className="p-3 w-3/8 text-slate-600">القيمة السابقة (المرجع)</th>
                  <th className="p-3 w-3/8 text-sky-800">القيمة الجديدة (المحدث)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50 bg-white">
                {allFieldKeys.map((field) => {
                  const isKey = field === config.keyField;
                  const diff = record.diffs[field];
                  const isChanged = diff?.isDifferent;

                  const oldVal = record.oldData?.[field] ?? '';
                  const newVal = record.newData?.[field] ?? '';

                  return (
                    <tr
                      key={field}
                      className={
                        isChanged
                          ? 'bg-amber-50/80 font-semibold'
                          : isKey
                          ? 'bg-violet-50/60'
                          : ''
                      }
                    >
                      <td className="p-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {isKey && (
                            <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] font-bold">
                              المفتاح
                            </span>
                          )}
                          <span>{field}</span>
                          {isChanged && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                              معدل
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Old Value */}
                      <td className="p-3 text-slate-700 font-mono">
                        {isChanged ? (
                          <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded line-through font-bold">
                            {oldVal || '(فارغ)'}
                          </span>
                        ) : (
                          <span>{oldVal || <em className="text-slate-400 font-sans">فارغ</em>}</span>
                        )}
                      </td>

                      {/* New Value */}
                      <td className="p-3 text-slate-900 font-mono">
                        {isChanged ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-black border border-emerald-100">
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
        <div className="px-6 py-3.5 bg-violet-50/60 border-t border-violet-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-violet-700 bg-white hover:bg-violet-50 border border-violet-200 rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
