import React, { useState, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  Printer,
  Eye,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ComparisonRow, ComparisonConfig, ComparisonStats } from '../types';
import { exportComparisonToExcel } from '../utils/excelParser';
import { RecordDetailsModal } from './RecordDetailsModal';

interface ComparisonTableProps {
  rows: ComparisonRow[];
  stats: ComparisonStats;
  config: ComparisonConfig;
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  activeFieldFilter: string | null;
  onClearFieldFilter: () => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  rows,
  stats,
  config,
  activeStatusFilter,
  onStatusFilterChange,
  activeFieldFilter,
  onClearFieldFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ComparisonRow | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Status filter
      if (activeStatusFilter !== 'all' && row.status !== activeStatusFilter) {
        return false;
      }

      // Field diff filter
      if (activeFieldFilter && !row.changedFields.includes(activeFieldFilter)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inKey = row.key.toLowerCase().includes(q);
        const inOld = row.oldData
          ? Object.values(row.oldData).some((v) => String(v).toLowerCase().includes(q))
          : false;
        const inNew = row.newData
          ? Object.values(row.newData).some((v) => String(v).toLowerCase().includes(q))
          : false;
        if (!inKey && !inOld && !inNew) return false;
      }

      return true;
    });
  }, [rows, activeStatusFilter, activeFieldFilter, searchQuery]);

  // Reset pagination when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeStatusFilter, activeFieldFilter, searchQuery, pageSize]);

  // Paginate
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const handleExportExcel = () => {
    try {
      exportComparisonToExcel(rows, stats, config.keyField, config.fieldsToCompare);
    } catch {
      window.alert('تعذر تصدير ملف Excel. حاول مرة أخرى.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string, diffCount: number) => {
    switch (status) {
      case 'identical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            مطابق
          </span>
        );
      case 'modified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            معدل ({diffCount})
          </span>
        );
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <UserPlus className="w-3 h-3 text-sky-500" />
            مضاف
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
            <UserMinus className="w-3 h-3 text-rose-400" />
            محذوف
          </span>
        );
      default:
        return null;
    }
  };

  // Determine key display columns in order
  const displayColumns = useMemo(() => {
    const cols = [...config.fieldsToCompare];
    // Prioritize phone and address in the preview
    return cols.slice(0, 4);
  }, [config.fieldsToCompare]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-4 sm:p-5 border-b border-violet-100 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status info & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-excel"
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-400 hover:bg-emerald-500 active:bg-emerald-600 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              id="btn-print-report"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-violet-700 bg-white hover:bg-violet-50 border border-violet-200 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>طباعة</span>
            </button>

            <span className="text-xs text-slate-500 mr-2">
              تم إنجاز المقارنة <strong className="text-slate-800 font-black">{stats.totalUniqueKeys.toLocaleString()}</strong> سجل | جاهز للتصدير والمشاركة
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              id="table-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالكود، الهاتف، العنوان..."
              className="w-full pl-3 pr-8 py-1.5 rounded-lg text-xs border border-violet-100 bg-violet-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-violet-50">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeStatusFilter === 'all'
                  ? 'bg-violet-400 text-white shadow-xs'
                  : 'bg-violet-50 hover:bg-violet-100 text-violet-800'
              }`}
            >
              الكل ({stats.totalUniqueKeys.toLocaleString()})
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange('modified')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeStatusFilter === 'modified'
                  ? 'bg-amber-300 text-amber-950 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              المعدلة ({stats.modifiedCount.toLocaleString()})
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange('added')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeStatusFilter === 'added'
                  ? 'bg-sky-300 text-sky-950 shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
              }`}
            >
              المضافة ({stats.addedCount.toLocaleString()})
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange('deleted')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeStatusFilter === 'deleted'
                  ? 'bg-rose-300 text-rose-950 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              المحذوفة ({stats.deletedCount.toLocaleString()})
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange('identical')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeStatusFilter === 'identical'
                  ? 'bg-emerald-300 text-emerald-950 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              المتطابقة ({stats.identicalCount.toLocaleString()})
            </button>
          </div>

          {activeFieldFilter && (
            <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg">
              <Filter className="w-3 h-3 text-amber-600" />
              <span>مفلترة حسب الحقل: <strong>{activeFieldFilter}</strong></span>
              <button
                type="button"
                onClick={onClearFieldFilter}
                className="text-amber-900 hover:text-rose-700 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="bg-violet-50/70 border-b border-violet-100 text-violet-800 font-bold">
              <th className="py-2.5 px-3.5 whitespace-nowrap">
                {config.keyField} (المفتاح)
              </th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">
                الحالة
              </th>
              {displayColumns.map((col) => (
                <th key={col} className="py-2.5 px-3.5 whitespace-nowrap">
                  {col}
                </th>
              ))}
              <th className="py-2.5 px-3.5 text-center whitespace-nowrap">
                الإجراء
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-50 text-slate-800">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={3 + displayColumns.length} className="py-8 text-center text-slate-400">
                  لا توجد نتائج تطابق معايير البحث والفلترة المحددة.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const isModified = row.status === 'modified';
                const isAdded = row.status === 'added';
                const isDeleted = row.status === 'deleted';

                return (
                  <tr
                    key={row.key}
                    className={`transition-colors ${
                      isModified
                        ? 'bg-amber-50/60 hover:bg-amber-50'
                        : isAdded
                        ? 'bg-sky-50/50 hover:bg-sky-50'
                        : isDeleted
                        ? 'bg-rose-50/50 hover:bg-rose-50 line-through opacity-80'
                        : 'hover:bg-violet-50/40'
                    }`}
                  >
                    {/* Primary Key */}
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {row.key}
                    </td>

                    {/* Status badge */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {getStatusBadge(row.status, row.changedFields.length)}
                    </td>

                    {/* Compare Fields */}
                    {displayColumns.map((col) => {
                      const hasChanged = row.changedFields.includes(col);
                      const currentVal = row.newData?.[col] ?? row.oldData?.[col] ?? '—';
                      const oldVal = row.oldData?.[col];

                      return (
                        <td
                          key={col}
                          className={`py-2.5 px-3.5 max-w-[200px] truncate ${
                            hasChanged ? 'bg-amber-50 font-bold text-amber-800' : ''
                          }`}
                          title={String(currentVal)}
                        >
                          {hasChanged ? (
                            <div>
                              <span>{String(currentVal || '(فارغ)')}</span>
                              {oldVal !== undefined && (
                                <span className="block text-[10px] text-slate-400 line-through">
                                  سابقاً: {String(oldVal || '(فارغ)')}
                                </span>
                              )}
                            </div>
                          ) : (
                            String(currentVal || '—')
                          )}
                        </td>
                      );
                    })}

                    {/* Action */}
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(row)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors cursor-pointer"
                        title="عرض تفاصيل الفروقات والحقول"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>تفاصيل</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Counter Footer */}
      <div className="p-3.5 bg-violet-50/50 border-t border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            إجمالي النتائج <strong className="text-slate-900 font-black">{filteredRows.length.toLocaleString()}</strong> سجل | عرض {pageSize} سجل
          </span>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-white border border-violet-100 rounded px-2 py-0.5 text-xs text-slate-700 cursor-pointer"
          >
            <option value={10}>10 لكل صفحة</option>
            <option value={25}>25 لكل صفحة</option>
            <option value={50}>50 لكل صفحة</option>
            <option value={100}>100 لكل صفحة</option>
          </select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 self-center">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-violet-100 bg-white hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="font-bold text-slate-800">
            صفحة {currentPage.toLocaleString()} من {totalPages.toLocaleString()}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-violet-100 bg-white hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          config={config}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};
