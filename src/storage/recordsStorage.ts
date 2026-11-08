import { BASES } from '../core/constants';
import type { GameRecord } from '../core/types';

const STORAGE_KEY = 'bulls-n-cows:records';

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isGameRecord = (value: unknown): value is GameRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    isNumber(record.attempts) &&
    isNumber(record.time) &&
    isNumber(record.length) &&
    isNumber(record.date) &&
    BASES.some((base) => base === record.base)
  );
};

export const loadRecords = (): GameRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed.filter(isGameRecord) : [];
  } catch {
    return [];
  }
};

export const saveRecords = (records: readonly GameRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage is unavailable (private mode or quota exceeded)
  }
};
