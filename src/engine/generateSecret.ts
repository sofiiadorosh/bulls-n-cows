import { DIGITS } from '../core/constants';
import type { Base } from '../core/types';

const pickDigits = (
  available: string,
  count: number,
  random: () => number,
): string => {
  if (count === 0) {
    return '';
  }

  const index = Math.floor(random() * available.length);
  const rest = available.slice(0, index) + available.slice(index + 1);

  return available[index] + pickDigits(rest, count - 1, random);
};

export const generateSecret = (
  length: number,
  base: Base,
  random: () => number = Math.random,
): string => pickDigits(DIGITS.slice(0, base), length, random);
