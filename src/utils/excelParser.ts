import * as XLSX from 'xlsx';
import { ComparisonRow, ComparisonStats, FileData } from '../types';

/**
 * Parse an Excel or CSV file from ArrayBuffer
 */
export async function parseSpreadsheet(file: File): Promise<FileData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('الملف لا يحتوي على أي أوراق عمل (Sheets).');
  }

  // Get the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON with headers
  const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: '',
  });

  if (rawData.length === 0) {
    throw new Error('ورقة العمل فارغة أو لا تحتوي على صفوف بيانات صالحة.');
  }

  // Extract unique column keys from all rows (preserving order of header)
  const columnsSet = new Set<string>();
  rawData.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key && !key.startsWith('__EMPTY')) {
        columnsSet.add(key.trim());
      }
    });
  });

  const columns = Array.from(columnsSet);

  // Clean data keys
  const cleanedRows = rawData.map(row => {
    const cleanRow: Record<string, any> = {};
    columns.forEach(col => {
      cleanRow[col] = row[col] !== undefined && row[col] !== null ? String(row[col]).trim() : '';
    });
    return cleanRow;
  });

  return {
    name: file.name,
    size: file.size,
    rowCount: cleanedRows.length,
    columns,
    rows: cleanedRows,
    uploadTime: new Date(),
  };
}

/**
 * Export comparison results to a multi-tab Excel workbook
 */
export function exportComparisonToExcel(
  rows: ComparisonRow[],
  stats: ComparisonStats,
  keyField: string,
  comparedFields: string[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = [
    ['تقرير مقارنة البيانات والفروقات التلقائية'],
    ['تاريخ الاستخراج', new Date().toLocaleString('ar-EG')],
    ['عمود الربط الأساسي (المفتاح)', keyField],
    ['الحقول المقارنة', comparedFields.join('، ')],
    [''],
    ['المؤشر', 'العدد', 'النسبة'],
    ['إجمالي المفاتيح الفريدة', stats.totalUniqueKeys, '100%'],
    ['سجلات مطابقة تماماً', stats.identicalCount, `${stats.matchPercentage}%`],
    ['سجلات معدلة (فروقات)', stats.modifiedCount, `${((stats.modifiedCount / (stats.totalUniqueKeys || 1)) * 100).toFixed(1)}%`],
    ['سجلات جديدة (مضافة)', stats.addedCount, `${((stats.addedCount / (stats.totalUniqueKeys || 1)) * 100).toFixed(1)}%`],
    ['سجلات مفقودة (محذوفة)', stats.deletedCount, `${((stats.deletedCount / (stats.totalUniqueKeys || 1)) * 100).toFixed(1)}%`],
    [''],
    ['توزيع الفروقات حسب الحقل'],
    ...Object.entries(stats.fieldDiffCounts).map(([field, count]) => [field, count, `${((count / (stats.totalUniqueKeys || 1)) * 100).toFixed(1)}%`])
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'ملخص التقرير');

  // 2. Modified Records Sheet (Detailed Diffs)
  const modifiedRows = rows.filter(r => r.status === 'modified');
  if (modifiedRows.length > 0) {
    const diffExportData: any[] = [];
    modifiedRows.forEach(r => {
      const diffFields = r.changedFields.map(f => {
        const d = r.diffs[f];
        return `${f}: [القديم: ${d?.oldValue || 'فارغ'}] -> [الجديد: ${d?.newValue || 'فارغ'}]`;
      }).join(' | ');

      const rowObj: Record<string, any> = {
        'المفتاح الأساسي': r.key,
        'عدد الفروقات': r.changedFields.length,
        'الحقول المعدلة': r.changedFields.join('، '),
        'تفاصيل الاختلاف': diffFields,
      };

      // Add individual field before/after columns
      comparedFields.forEach(field => {
        const diff = r.diffs[field];
        if (diff && diff.isDifferent) {
          rowObj[`${field} (القديم)`] = diff.oldValue;
          rowObj[`${field} (الجديد)`] = diff.newValue;
        } else {
          rowObj[field] = diff ? diff.newValue : (r.newData?.[field] || r.oldData?.[field] || '');
        }
      });

      diffExportData.push(rowObj);
    });

    const modifiedWs = XLSX.utils.json_to_sheet(diffExportData);
    XLSX.utils.book_append_sheet(wb, modifiedWs, 'السجلات المعدلة');
  }

  // 3. Added Records Sheet
  const addedRows = rows.filter(r => r.status === 'added');
  if (addedRows.length > 0) {
    const addedExportData = addedRows.map(r => ({
      'المفتاح الأساسي': r.key,
      ...(r.newData || {})
    }));
    const addedWs = XLSX.utils.json_to_sheet(addedExportData);
    XLSX.utils.book_append_sheet(wb, addedWs, 'سجلات جديدة مضافة');
  }

  // 4. Deleted Records Sheet
  const deletedRows = rows.filter(r => r.status === 'deleted');
  if (deletedRows.length > 0) {
    const deletedExportData = deletedRows.map(r => ({
      'المفتاح الأساسي': r.key,
      ...(r.oldData || {})
    }));
    const deletedWs = XLSX.utils.json_to_sheet(deletedExportData);
    XLSX.utils.book_append_sheet(wb, deletedWs, 'سجلات مفقودة محذوفة');
  }

  // 5. All Records Overview Sheet
  const allOverviewData = rows.map(r => {
    const statusLabel = 
      r.status === 'identical' ? 'مطابق تماماً' :
      r.status === 'modified' ? `معدل (${r.changedFields.length} فرق)` :
      r.status === 'added' ? 'جديد (مضاف)' : 'محذوف (مفقود)';
    
    return {
      'المفتاح': r.key,
      'الحالة': statusLabel,
      'الحقول المعدلة': r.changedFields.join('، '),
      ...(r.newData || r.oldData || {})
    };
  });
  const allWs = XLSX.utils.json_to_sheet(allOverviewData);
  XLSX.utils.book_append_sheet(wb, allWs, 'كافة السجلات');

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `تقرير_مقارنة_الفروقات_${dateStr}.xlsx`);
}
