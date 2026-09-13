import React, { useState, useMemo, useEffect } from 'react';
import { HeaderBanner } from './components/HeaderBanner';
import { FileUploadSection } from './components/FileUploadSection';
import { FieldMappingPanel } from './components/FieldMappingPanel';
import { DashboardStats } from './components/DashboardStats';
import { ComparisonTable } from './components/ComparisonTable';
import { FileData, ComparisonConfig } from './types';
import { SAMPLE_OLD_DATA, SAMPLE_NEW_DATA } from './data/sampleData';
import { parseSpreadsheet } from './utils/excelParser';
import { compareDatasets } from './utils/comparator';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [oldFile, setOldFile] = useState<FileData | null>(null);
  const [newFile, setNewFile] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [config, setConfig] = useState<ComparisonConfig>({
    keyField: 'الكود',
    fieldsToCompare: ['رقم الهاتف', 'رقم الهاتف 2', 'المحافظات', 'استلام البضاعة', 'الحالة'],
    normalizePhones: true,
    ignoreWhitespace: true,
    normalizeArabic: true,
  });

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string | null>(null);

  // Load sample demo data matching the user's reference numbers and structure
  const loadDemoData = () => {
    setErrorMessage(null);
    const columns = Object.keys(SAMPLE_OLD_DATA[0]);

    const demoOld: FileData = {
      name: 'قاعدة بيانات عملاء اطلس.xlsx',
      size: 1394608, // ~1.33 MB
      rowCount: SAMPLE_OLD_DATA.length,
      columns,
      rows: SAMPLE_OLD_DATA,
      uploadTime: new Date(),
    };

    const demoNew: FileData = {
      name: 'coustmer info.xlsx',
      size: 1394608, // ~1.33 MB
      rowCount: SAMPLE_NEW_DATA.length,
      columns,
      rows: SAMPLE_NEW_DATA,
      uploadTime: new Date(),
    };

    setOldFile(demoOld);
    setNewFile(demoNew);

    setConfig({
      keyField: 'الكود',
      fieldsToCompare: ['رقم الهاتف', 'رقم الهاتف 2', 'المحافظات', 'استلام البضاعة', 'الحالة'],
      normalizePhones: true,
      ignoreWhitespace: true,
      normalizeArabic: true,
    });
    setSelectedStatusFilter('all');
    setSelectedFieldFilter(null);
  };

  // Load demo data on first load
  useEffect(() => {
    loadDemoData();
  }, []);

  // Handle uploaded file for Old / Reference
  const handleOldFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const parsed = await parseSpreadsheet(file);
      if (!parsed.columns.length) {
        throw new Error('لم يتم العثور على أعمدة صالحة في الملف الأول.');
      }
      setOldFile(parsed);

      // Auto-detect key column if not selected or invalid
      if (!parsed.columns.includes(config.keyField)) {
        const bestKey =
          parsed.columns.find((c) =>
            c.toLowerCase().includes('كود') ||
            c.toLowerCase().includes('معرف') ||
            c.toLowerCase().includes('رقم') ||
            c.toLowerCase().includes('id') ||
            c.toLowerCase().includes('code')
          ) || parsed.columns[0];

        const defaultFields = parsed.columns.filter((c) => c !== bestKey);

        setConfig((prev) => ({
          ...prev,
          keyField: bestKey,
          fieldsToCompare: defaultFields,
        }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر قراءة ملف Excel أو CSV. يرجى التأكد من سلامة الملف.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle uploaded file for New / Updated
  const handleNewFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const parsed = await parseSpreadsheet(file);
      if (!parsed.columns.length) {
        throw new Error('لم يتم العثور على أعمدة صالحة في الملف الثاني.');
      }
      setNewFile(parsed);
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر قراءة ملف Excel أو CSV. يرجى التأكد من سلامة الملف.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapFiles = () => {
    const temp = oldFile;
    setOldFile(newFile);
    setNewFile(temp);
  };

  const handleReset = () => {
    setOldFile(null);
    setNewFile(null);
    setErrorMessage(null);
    setSelectedStatusFilter('all');
    setSelectedFieldFilter(null);
  };

  // Extract all available columns from both files
  const availableColumns = useMemo(() => {
    const colsSet = new Set<string>();
    if (oldFile) oldFile.columns.forEach((c) => colsSet.add(c));
    if (newFile) newFile.columns.forEach((c) => colsSet.add(c));
    return Array.from(colsSet);
  }, [oldFile, newFile]);

  const comparisonResult = useMemo(() => {
    if (!oldFile || !newFile || !config.keyField) return null;
    try {
      return compareDatasets(oldFile.rows, newFile.rows, config);
    } catch {
      return null;
    }
  }, [oldFile, newFile, config]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Tajawal',sans-serif] text-slate-900" dir="rtl">
      {/* Top Banner & Files Section */}
      <header className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 w-full">
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold px-2 py-1 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Top Split Layout: Dark Banner (Right) + File Upload (Left) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* In RTL: Col 1 is on the Right */}
          <div className="lg:col-span-5 flex">
            <HeaderBanner
              onLoadDemo={loadDemoData}
              onReset={handleReset}
              hasData={Boolean(oldFile || newFile)}
            />
          </div>

          {/* In RTL: Col 2 is on the Left */}
          <div className="lg:col-span-7 flex">
            <FileUploadSection
              oldFile={oldFile}
              newFile={newFile}
              onOldFileUpload={handleOldFileUpload}
              onNewFileUpload={handleNewFileUpload}
              onRemoveOldFile={() => setOldFile(null)}
              onRemoveNewFile={() => setNewFile(null)}
              onSwapFiles={handleSwapFiles}
              isLoading={isLoading}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Right Sidebar (In RTL: Column 1) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            {availableColumns.length > 0 ? (
              <FieldMappingPanel
                availableColumns={availableColumns}
                config={config}
                onConfigChange={setConfig}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">
                <p className="text-xs">يرجى رفع الملفات لتحديد المفتاح الأساسي والحقول.</p>
              </div>
            )}
          </div>

          {/* Left Main Content (In RTL: Column 2) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-5">
            {comparisonResult ? (
              <>
                {/* 3. Dashboard Stats */}
                <DashboardStats
                  stats={comparisonResult.stats}
                  selectedStatusFilter={selectedStatusFilter}
                  onSelectStatusFilter={setSelectedStatusFilter}
                  selectedFieldFilter={selectedFieldFilter}
                  onSelectFieldFilter={setSelectedFieldFilter}
                  keyField={config.keyField}
                />

                {/* 4. Comparison Table */}
                <ComparisonTable
                  rows={comparisonResult.rows}
                  stats={comparisonResult.stats}
                  config={config}
                  activeStatusFilter={selectedStatusFilter}
                  onStatusFilterChange={setSelectedStatusFilter}
                  activeFieldFilter={selectedFieldFilter}
                  onClearFieldFilter={() => setSelectedFieldFilter(null)}
                />
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                <p className="text-sm font-bold text-slate-600 mb-1">
                  لم يتم إجراء المقارنة بعد
                </p>
                <p className="text-xs text-slate-400">
                  قم برفع الملف الأول والملف الثاني أو انقر على &quot;تجربة بيانات نموذجية&quot; للمعاينة الفورية.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>أداة مقارنة الملفات وتحديد الفروقات التلقائية — معالجة فورية ومحلية آمنة 100%</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            لا يتم إرسال أي بيانات أو ملفات إلى خوادم خارجية
          </span>
        </div>
      </footer>
    </div>
  );
}
