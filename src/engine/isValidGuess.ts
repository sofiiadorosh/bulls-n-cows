import { createDigitValidator } from './createDigitValidator';
import type { Base } from '../core/types';

export const isValidGuess = (
  guess: string,
  length: number,
  base: Base,
): boolean => {
  const isDigit = createDigitValidator(base);
  const chars = [...guess.toLowerCase()];

  return (
    chars.length === length &&
    chars.every(isDigit) &&
    new Set(chars).size === chars.length
  );
};
