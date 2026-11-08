import { createDigitValidator } from '../src/engine/createDigitValidator';

describe('createDigitValidator', () => {
  it('returns a predicate function', () => {
    expect(typeof createDigitValidator(10)).toBe('function');
  });

  describe('binary (base 2)', () => {
    const isBinaryDigit = createDigitValidator(2);

    it.each(['0', '1'])('accepts "%s"', (char) => {
      expect(isBinaryDigit(char)).toBe(true);
    });

    it.each(['2', '9', 'a'])('rejects "%s"', (char) => {
      expect(isBinaryDigit(char)).toBe(false);
    });
  });

  describe('octal (base 8)', () => {
    const isOctalDigit = createDigitValidator(8);

    it.each(['0', '3', '7'])('accepts "%s"', (char) => {
      expect(isOctalDigit(char)).toBe(true);
    });

    it.each(['8', '9', 'a'])('rejects "%s"', (char) => {
      expect(isOctalDigit(char)).toBe(false);
    });
  });

  describe('decimal (base 10)', () => {
    const isDecimalDigit = createDigitValidator(10);

    it.each(['0', '5', '9'])('accepts "%s"', (char) => {
      expect(isDecimalDigit(char)).toBe(true);
    });

    it.each(['a', 'f', 'A'])('rejects "%s"', (char) => {
      expect(isDecimalDigit(char)).toBe(false);
    });
  });

  describe('hexadecimal (base 16)', () => {
    const isHexDigit = createDigitValidator(16);

    it.each(['0', '9', 'a', 'f'])('accepts lowercase "%s"', (char) => {
      expect(isHexDigit(char)).toBe(true);
    });

    it.each(['A', 'C', 'F'])('accepts uppercase "%s"', (char) => {
      expect(isHexDigit(char)).toBe(true);
    });

    it.each(['g', 'G', 'z'])('rejects "%s"', (char) => {
      expect(isHexDigit(char)).toBe(false);
    });
  });

  describe('non-digit input', () => {
    const isHexDigit = createDigitValidator(16);

    it.each(['', ' ', '-', '.', '12', 'ab'])('rejects "%s"', (char) => {
      expect(isHexDigit(char)).toBe(false);
    });
  });
});
