export type RecordStatus = 'identical' | 'modified' | 'added' | 'deleted';

export interface FieldDiff {
  fieldName: string;
  oldValue: string;
  newValue: string;
  isDifferent: boolean;
}

export interface ComparisonRow {
  id: string;
  key: string;
  status: RecordStatus;
  oldData: Record<string, any> | null;
  newData: Record<string, any> | null;
  diffs: Record<string, FieldDiff>;
  changedFields: string[];
}

export interface FileData {
  name: string;
  size: number;
  rowCount: number;
  columns: string[];
  rows: Record<string, any>[];
  uploadTime: Date;
}

export interface ComparisonConfig {
  keyField: string;
  fieldsToCompare: string[];
  normalizePhones: boolean;
  ignoreWhitespace: boolean;
  normalizeArabic: boolean;
}

export interface ComparisonStats {
  totalOld: number;
  totalNew: number;
  totalUniqueKeys: number;
  identicalCount: number;
  modifiedCount: number;
  addedCount: number;
  deletedCount: number;
  matchPercentage: number;
  fieldDiffCounts: Record<string, number>;
}
