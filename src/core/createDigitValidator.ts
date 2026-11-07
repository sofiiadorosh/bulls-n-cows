import { DIGITS } from './constants';
import type { Base, DigitValidator } from './types';

export const createDigitValidator = (base: Base): DigitValidator => {
  const allowedDigits = DIGITS.slice(0, base);

  return (char) =>
    char.length === 1 && allowedDigits.includes(char.toLowerCase());
};
