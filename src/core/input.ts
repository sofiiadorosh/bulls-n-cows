import type { DigitValidator } from './types';

export const filterGuessInput = (
  value: string,
  isDigit: DigitValidator,
  maxLength: number,
): string => [...value].filter(isDigit).slice(0, maxLength).join('');
