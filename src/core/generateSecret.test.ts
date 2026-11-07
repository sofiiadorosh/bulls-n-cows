import { generateSecret } from './generateSecret';
import { isValidGuess } from './isValidGuess';
import type { Base } from './types';

const createSequence = (values: number[]) => {
  let index = 0;

  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
};

type Case = { length: number; base: Base };

describe('generateSecret', () => {
  describe('with a deterministic random source', () => {
    it('picks the first available digits when random returns 0', () => {
      expect(generateSecret(4, 10, () => 0)).toBe('0123');
    });

    it('picks the last available digits when random returns 0.999', () => {
      expect(generateSecret(4, 10, () => 0.999)).toBe('9876');
    });

    it('follows a sequence of random values', () => {
      const random = createSequence([0.5, 0, 0.99, 0.1]);

      expect(generateSecret(4, 10, random)).toBe('5091');
    });

    it('returns the same secret for the same random sequence', () => {
      const values = [0.3, 0.7, 0.1, 0.9];

      const first = generateSecret(4, 16, createSequence(values));
      const second = generateSecret(4, 16, createSequence(values));

      expect(first).toBe(second);
    });

    it('works in binary', () => {
      expect(generateSecret(2, 2, () => 0)).toBe('01');
      expect(generateSecret(2, 2, () => 0.999)).toBe('10');
    });

    it('uses lowercase hex digits', () => {
      expect(generateSecret(2, 16, () => 0.999)).toBe('fe');
    });

    it('uses the provided random source', () => {
      const random = jest.fn(() => 0);

      generateSecret(4, 10, random);

      expect(random).toHaveBeenCalled();
    });
  });

  describe('produces a valid secret for every game setting', () => {
    it.each<Case>([
      { length: 2, base: 2 },
      { length: 2, base: 8 },
      { length: 6, base: 8 },
      { length: 2, base: 10 },
      { length: 4, base: 10 },
      { length: 6, base: 10 },
      { length: 2, base: 16 },
      { length: 6, base: 16 },
    ])('length $length, base $base', ({ length, base }) => {
      const random = createSequence([0.42, 0.13, 0.87, 0.5, 0.99, 0]);
      const secret = generateSecret(length, base, random);

      expect(isValidGuess(secret, length, base)).toBe(true);
    });
  });

  describe('with the default Math.random', () => {
    it('produces a valid secret', () => {
      const secret = generateSecret(4, 10);

      expect(isValidGuess(secret, 4, 10)).toBe(true);
    });
  });
});
