import { ComparisonConfig, ComparisonRow, ComparisonStats, FieldDiff } from '../types';

/**
 * Normalize Arabic text characters for fair comparison
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, ''); // Remove tashkeel/diacritics
}

/**
 * Normalize phone numbers (strip spaces, symbols, and harmonize 07xxx and 9647xxx)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Keep only digits
  let digits = phone.replace(/\D/g, '');
  
  // Harmonize Iraqi numbers: 009647... or 9647... -> 07...
  if (digits.startsWith('00964')) {
    digits = '0' + digits.slice(5);
  } else if (digits.startsWith('964')) {
    digits = '0' + digits.slice(3);
  }
  return digits;
}

/**
 * Normalize a single value based on config
 */
export function normalizeValue(
  val: any,
  fieldName: string,
  config: ComparisonConfig
): string {
  if (val === null || val === undefined) return '';
  let str = String(val);

  if (config.ignoreWhitespace) {
    str = str.replace(/\s+/g, ' ').trim();
  }

  const lowerField = fieldName.toLowerCase();
  const isPhoneField =
    lowerField.includes('هاتف') ||
    lowerField.includes('موبايل') ||
    lowerField.includes('جوال') ||
    lowerField.includes('phone') ||
    lowerField.includes('mobile') ||
    lowerField.includes('tel');

  if (config.normalizePhones && isPhoneField) {
    str = normalizePhoneNumber(str);
  }

  if (config.normalizeArabic) {
    str = normalizeArabicText(str);
  }

  return str;
}

/**
 * Compare two datasets row by row based on chosen keyField and compared fields
 */
export function compareDatasets(
  oldRows: Record<string, any>[],
  newRows: Record<string, any>[],
  config: ComparisonConfig
): { rows: ComparisonRow[]; stats: ComparisonStats } {
  const { keyField, fieldsToCompare } = config;

  // Build maps by key
  const oldMap = new Map<string, Record<string, any>>();
  oldRows.forEach(row => {
    const rawKey = row[keyField];
    if (rawKey !== undefined && rawKey !== null) {
      const normalizedKey = String(rawKey).trim();
      if (normalizedKey) {
        oldMap.set(normalizedKey, row);
      }
    }
  });

  const newMap = new Map<string, Record<string, any>>();
  newRows.forEach(row => {
    const rawKey = row[keyField];
    if (rawKey !== undefined && rawKey !== null) {
      const normalizedKey = String(rawKey).trim();
      if (normalizedKey) {
        newMap.set(normalizedKey, row);
      }
    }
  });

  // Get all unique keys
  const allKeys = Array.from(new Set([...oldMap.keys(), ...newMap.keys()]));

  const comparisonRows: ComparisonRow[] = [];
  const fieldDiffCounts: Record<string, number> = {};
  fieldsToCompare.forEach(f => {
    fieldDiffCounts[f] = 0;
  });

  let identicalCount = 0;
  let modifiedCount = 0;
  let addedCount = 0;
  let deletedCount = 0;

  allKeys.forEach((key, index) => {
    const oldRow = oldMap.get(key) || null;
    const newRow = newMap.get(key) || null;

    if (oldRow && !newRow) {
      // Deleted / Missing
      deletedCount++;
      const diffs: Record<string, FieldDiff> = {};
      fieldsToCompare.forEach(field => {
        const oldVal = oldRow[field] !== undefined ? String(oldRow[field]) : '';
        diffs[field] = {
          fieldName: field,
          oldValue: oldVal,
          newValue: '',
          isDifferent: true,
        };
      });

      comparisonRows.push({
        id: `row-${index}-${key}`,
        key,
        status: 'deleted',
        oldData: oldRow,
        newData: null,
        diffs,
        changedFields: [...fieldsToCompare],
      });
    } else if (!oldRow && newRow) {
      // Added / New
      addedCount++;
      const diffs: Record<string, FieldDiff> = {};
      fieldsToCompare.forEach(field => {
        const newVal = newRow[field] !== undefined ? String(newRow[field]) : '';
        diffs[field] = {
          fieldName: field,
          oldValue: '',
          newValue: newVal,
          isDifferent: true,
        };
      });

      comparisonRows.push({
        id: `row-${index}-${key}`,
        key,
        status: 'added',
        oldData: null,
        newData: newRow,
        diffs,
        changedFields: [...fieldsToCompare],
      });
    } else if (oldRow && newRow) {
      // Both exist - compare fields
      const diffs: Record<string, FieldDiff> = {};
      const changedFields: string[] = [];

      fieldsToCompare.forEach(field => {
        const rawOld = oldRow[field] !== undefined ? String(oldRow[field]) : '';
        const rawNew = newRow[field] !== undefined ? String(newRow[field]) : '';

        const normOld = normalizeValue(rawOld, field, config);
        const normNew = normalizeValue(rawNew, field, config);

        const isDiff = normOld !== normNew;
        if (isDiff) {
          changedFields.push(field);
          fieldDiffCounts[field] = (fieldDiffCounts[field] || 0) + 1;
        }

        diffs[field] = {
          fieldName: field,
          oldValue: rawOld,
          newValue: rawNew,
          isDifferent: isDiff,
        };
      });

      if (changedFields.length > 0) {
        modifiedCount++;
        comparisonRows.push({
          id: `row-${index}-${key}`,
          key,
          status: 'modified',
          oldData: oldRow,
          newData: newRow,
          diffs,
          changedFields,
        });
      } else {
        identicalCount++;
        comparisonRows.push({
          id: `row-${index}-${key}`,
          status: 'identical',
          key,
          oldData: oldRow,
          newData: newRow,
          diffs,
          changedFields: [],
        });
      }
    }
  });

  const totalUnique = allKeys.length;
  const matchPercentage = totalUnique > 0 ? Math.round((identicalCount / totalUnique) * 100) : 100;

  const stats: ComparisonStats = {
    totalOld: oldRows.length,
    totalNew: newRows.length,
    totalUniqueKeys: totalUnique,
    identicalCount,
    modifiedCount,
    addedCount,
    deletedCount,
    matchPercentage,
    fieldDiffCounts,
  };

  return { rows: comparisonRows, stats };
}
