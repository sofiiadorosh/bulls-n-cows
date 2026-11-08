export const DIGITS = '0123456789abcdef';

export const LENGTHS = [2, 3, 4, 5, 6];

export const BASES = [2, 8, 10, 16] as const;

export const BASE_NAMES = {
  2: 'bin',
  8: 'oct',
  10: 'dec',
  16: 'hex',
} as const;

export const RECORDS_LIMIT = 10;

export const DEFAULT_SETTINGS = { length: 4, base: 10 } as const;
