import { evaluateGuess } from './evaluateGuess';

type Case = { secret: string; guess: string; bulls: number; cows: number };

describe('evaluateGuess', () => {
  it.each<Case>([
    { secret: '1234', guess: '1234', bulls: 4, cows: 0 },
    { secret: '1234', guess: '4321', bulls: 0, cows: 4 },
    { secret: '1234', guess: '5678', bulls: 0, cows: 0 },
    { secret: '1234', guess: '1243', bulls: 2, cows: 2 },
    { secret: '1234', guess: '1356', bulls: 1, cows: 1 },
    { secret: '1234', guess: '5241', bulls: 1, cows: 2 },
    { secret: '1234', guess: '5671', bulls: 0, cows: 1 },
  ])(
    'secret "$secret", guess "$guess" → $bulls bulls, $cows cows',
    ({ secret, guess, bulls, cows }) => {
      expect(evaluateGuess(secret, guess)).toEqual({ bulls, cows });
    },
  );

  describe('leading zero', () => {
    it('treats 0 as a regular digit', () => {
      expect(evaluateGuess('0123', '0132')).toEqual({ bulls: 2, cows: 2 });
    });
  });

  describe('other bases', () => {
    it('works in binary', () => {
      expect(evaluateGuess('01', '10')).toEqual({ bulls: 0, cows: 2 });
    });

    it('works in octal', () => {
      expect(evaluateGuess('7654', '7645')).toEqual({ bulls: 2, cows: 2 });
    });

    it('works with max length', () => {
      expect(evaluateGuess('012345', '543210')).toEqual({ bulls: 0, cows: 6 });
    });
  });

  describe('hexadecimal case-insensitivity', () => {
    it('counts uppercase guess as bulls', () => {
      expect(evaluateGuess('a1f9', 'A1F9')).toEqual({ bulls: 4, cows: 0 });
    });

    it('counts uppercase guess as cows', () => {
      expect(evaluateGuess('ab12', 'BA21')).toEqual({ bulls: 0, cows: 4 });
    });

    it('works with uppercase secret', () => {
      expect(evaluateGuess('AB12', 'ab12')).toEqual({ bulls: 4, cows: 0 });
    });
  });
});
