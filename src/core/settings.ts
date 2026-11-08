import { BASES } from './constants';
import { getAvailableLengths } from './getAvailableLengths';
import type { Base, Settings } from './types';

export const parseBase = (value: string): Base | null =>
  BASES.find((base) => String(base) === value) ?? null;

export const normalizeSettings = (settings: Settings): Settings => {
  const available = getAvailableLengths(settings.base);

  return available.includes(settings.length)
    ? settings
    : { ...settings, length: available[available.length - 1] };
};
