import type { GuessResult } from './types';

export const evaluateGuess = (secret: string, guess: string): GuessResult => {
  const secretChars = [...secret.toLowerCase()];
  const guessChars = [...guess.toLowerCase()];

  const bulls = guessChars.filter(
    (char, index) => char === secretChars[index],
  ).length;

  const matches = guessChars.filter((char) =>
    secretChars.includes(char),
  ).length;

  return { bulls, cows: matches - bulls };
};
