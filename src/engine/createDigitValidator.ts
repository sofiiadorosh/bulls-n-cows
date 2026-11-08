import { DIGITS } from '../core/constants';
import type { Base, DigitValidator } from '../core/types';

export const createDigitValidator = (base: Base): DigitValidator => {
  const allowedDigits = DIGITS.slice(0, base);

  return (char) =>
    char.length === 1 && allowedDigits.includes(char.toLowerCase());
};
