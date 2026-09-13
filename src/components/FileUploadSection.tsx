import React, { useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Trash2, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadSectionProps {
  oldFile: FileData | null;
  newFile: FileData | null;
  onOldFileUpload: (file: File) => void;
  onNewFileUpload: (file: File) => void;
  onRemoveOldFile: () => void;
  onRemoveNewFile: () => void;
  onSwapFiles: () => void;
  isLoading: boolean;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  oldFile,
  newFile,
  onOldFileUpload,
  onNewFileUpload,
  onRemoveOldFile,
  onRemoveNewFile,
  onSwapFiles,
  isLoading,
}) => {
  const oldInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrop = (e: React.DragEvent, type: 'old' | 'new') => {
    e.preventDefault();
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (type === 'old') onOldFileUpload(file);
      else onNewFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const bothFilesLoaded = Boolean(oldFile && newFile);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col justify-between h-full">
      {/* Hidden File Inputs */}
      <input
        ref={oldInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        disabled={isLoading}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onOldFileUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />
      <input
        ref={newInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        disabled={isLoading}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onNewFileUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-xs font-black flex items-center justify-center border border-blue-100">
            1
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            رفع أو تحديد الملفين المراد مقارنتهما
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {bothFilesLoaded ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>الملفان جاهزان</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <span>بانتظار الملفات</span>
            </span>
          )}

          {bothFilesLoaded && (
            <button
              type="button"
              onClick={onSwapFiles}
              title="تبديل موقع الملفين (القديم ⇄ الجديد)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
          جاري قراءة الملف، يرجى الانتظار...
        </div>
      )}

      {/* Two File Cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
        {/* File 1: Old / Reference */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="mb-2">
            <span className="block text-xs font-bold text-slate-800 mb-0.5">
              الملف الأول (المرجع / السابق)
            </span>
            <span className="block text-[11px] text-slate-500">
              الملف الأساسي قبل التعديلات (مثل كشف 2024)
            </span>
          </div>

          {oldFile ? (
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate" title={oldFile.name}>
                      {oldFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(oldFile.size)} | {oldFile.rowCount.toLocaleString()} سجل | {oldFile.columns.length} أعمدة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => oldInputRef.current?.click()}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded text-[11px] font-medium"
                    title="تغيير الملف"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onRemoveOldFile}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[11px]"
                    title="حذف الملف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column chips preview */}
              <div className="pt-1.5 border-t border-slate-100">
                <p className="text-[10px] text-slate-500 truncate" title={oldFile.columns.join('، ')}>
                  <span className="font-semibold text-slate-600">الأعمدة:</span>{' '}
                  {oldFile.columns.slice(0, 6).join('، ')}
                  {oldFile.columns.length > 6 ? ` (+${oldFile.columns.length - 6})` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div
              onDrop={(e) => handleDrop(e, 'old')}
              onDragOver={handleDragOver}
              onClick={() => {
                if (!isLoading) oldInputRef.current?.click();
              }}
              className={`border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-lg p-3 text-center transition-colors ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <UploadCloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
              <p className="text-xs font-bold text-blue-600">انقر لرفع الملف الأول</p>
              <p className="text-[10px] text-slate-400">أو اسحب ملف Excel / CSV هنا</p>
            </div>
          )}
        </div>

        {/* File 2: New / Updated */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="mb-2">
            <span className="block text-xs font-bold text-slate-800 mb-0.5">
              الملف الثاني (المحدث / الجديد)
            </span>
            <span className="block text-[11px] text-slate-500">
              الملف الذي يحتوي التعيينات والتحديثات (مثل كشف 2024)
            </span>
          </div>

          {newFile ? (
            <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate" title={newFile.name}>
                      {newFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(newFile.size)} | {newFile.rowCount.toLocaleString()} سجل | {newFile.columns.length} أعمدة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => newInputRef.current?.click()}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded text-[11px] font-medium"
                    title="تغيير الملف"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onRemoveNewFile}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[11px]"
                    title="حذف الملف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column chips preview */}
              <div className="pt-1.5 border-t border-slate-100">
                <p className="text-[10px] text-slate-500 truncate" title={newFile.columns.join('، ')}>
                  <span className="font-semibold text-slate-600">الأعمدة:</span>{' '}
                  {newFile.columns.slice(0, 6).join('، ')}
                  {newFile.columns.length > 6 ? ` (+${newFile.columns.length - 6})` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div
              onDrop={(e) => handleDrop(e, 'new')}
              onDragOver={handleDragOver}
              onClick={() => {
                if (!isLoading) newInputRef.current?.click();
              }}
              className={`border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-lg p-3 text-center transition-colors ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <UploadCloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
              <p className="text-xs font-bold text-blue-600">انقر لرفع الملف الثاني</p>
              <p className="text-[10px] text-slate-400">أو اسحب ملف Excel / CSV هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
