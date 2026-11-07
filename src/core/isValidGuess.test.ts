import { isValidGuess } from './isValidGuess';
import type { Base } from './types';

type Case = { guess: string; length: number; base: Base };

describe('isValidGuess', () => {
  describe('valid guesses', () => {
    it.each<Case>([
      { guess: '1234', length: 4, base: 10 },
      { guess: '0123', length: 4, base: 10 },
      { guess: '01', length: 2, base: 2 },
      { guess: '7654', length: 4, base: 8 },
      { guess: 'a1f9', length: 4, base: 16 },
      { guess: 'A1F9', length: 4, base: 16 },
      { guess: '987654', length: 6, base: 10 },
    ])(
      'accepts "$guess" (length $length, base $base)',
      ({ guess, length, base }) => {
        expect(isValidGuess(guess, length, base)).toBe(true);
      },
    );
  });

  describe('wrong length', () => {
    it.each<Case>([
      { guess: '', length: 4, base: 10 },
      { guess: '123', length: 4, base: 10 },
      { guess: '12345', length: 4, base: 10 },
    ])('rejects "$guess" (length $length)', ({ guess, length, base }) => {
      expect(isValidGuess(guess, length, base)).toBe(false);
    });
  });

  describe('invalid digits for the base', () => {
    it.each<Case>([
      { guess: '12', length: 2, base: 2 },
      { guess: '1238', length: 4, base: 8 },
      { guess: '12a4', length: 4, base: 10 },
      { guess: '12g4', length: 4, base: 16 },
      { guess: '12 4', length: 4, base: 10 },
      { guess: '-123', length: 4, base: 10 },
    ])('rejects "$guess" (base $base)', ({ guess, length, base }) => {
      expect(isValidGuess(guess, length, base)).toBe(false);
    });
  });

  describe('repeated digits', () => {
    it.each<Case>([
      { guess: '00', length: 2, base: 2 },
      { guess: '1123', length: 4, base: 10 },
      { guess: '1231', length: 4, base: 10 },
      { guess: 'abca', length: 4, base: 16 },
      { guess: 'aA12', length: 4, base: 16 },
    ])('rejects "$guess"', ({ guess, length, base }) => {
      expect(isValidGuess(guess, length, base)).toBe(false);
    });
  });
});
