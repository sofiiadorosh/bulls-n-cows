import { countPossibleSecrets } from '../src/engine/countPossibleSecrets';

type Case = { length: number; base: number; expected: number };

describe('countPossibleSecrets', () => {
  describe('game settings', () => {
    it.each<Case>([
      { length: 2, base: 2, expected: 2 },
      { length: 4, base: 8, expected: 1680 },
      { length: 6, base: 8, expected: 20160 },
      { length: 2, base: 10, expected: 90 },
      { length: 4, base: 10, expected: 5040 },
      { length: 6, base: 10, expected: 151200 },
      { length: 2, base: 16, expected: 240 },
      { length: 4, base: 16, expected: 43680 },
      { length: 6, base: 16, expected: 5765760 },
    ])(
      'length $length, base $base → $expected',
      ({ length, base, expected }) => {
        expect(countPossibleSecrets(length, base)).toBe(expected);
      },
    );
  });

  describe('edge cases', () => {
    it('returns 1 for length 0', () => {
      expect(countPossibleSecrets(0, 10)).toBe(1);
    });

    it('returns base for length 1', () => {
      expect(countPossibleSecrets(1, 10)).toBe(10);
    });

    it('returns 0 when length exceeds the number of digits', () => {
      expect(countPossibleSecrets(3, 2)).toBe(0);
    });
  });

  it('returns the same result on repeated calls', () => {
    expect(countPossibleSecrets(4, 10)).toBe(countPossibleSecrets(4, 10));
  });
});
