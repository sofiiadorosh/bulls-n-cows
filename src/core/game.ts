import { evaluateGuess } from './evaluateGuess';
import { generateSecret } from './generateSecret';
import { isValidGuess } from './isValidGuess';
import type { GameState, GuessEntry, Settings } from './types';

export const createGame = (
  settings: Settings,
  random: () => number = Math.random,
  now: number = Date.now(),
): GameState => ({
  settings,
  secret: generateSecret(settings.length, settings.base, random),
  history: [],
  status: 'playing',
  startedAt: now,
  finishedAt: null,
});

export const hasGuessed = (state: GameState, guess: string): boolean =>
  state.history.some((entry) => entry.guess === guess.toLowerCase());

export const makeGuess = (
  state: GameState,
  guess: string,
  now: number = Date.now(),
): GameState => {
  const { settings, secret, history, status } = state;
  const normalizedGuess = guess.toLowerCase();

  if (
    status !== 'playing' ||
    !isValidGuess(normalizedGuess, settings.length, settings.base) ||
    hasGuessed(state, normalizedGuess)
  ) {
    return state;
  }

  const result = evaluateGuess(secret, normalizedGuess);
  const entry: GuessEntry = { guess: normalizedGuess, ...result };
  const isWon = result.bulls === settings.length;

  return {
    ...state,
    history: [...history, entry],
    status: isWon ? 'won' : 'playing',
    finishedAt: isWon ? now : null,
  };
};

export const getAttempts = (state: GameState): number => state.history.length;

export const getElapsedTime = (
  state: GameState,
  now: number = Date.now(),
): number => (state.finishedAt ?? now) - state.startedAt;
