export type Base = 2 | 8 | 10 | 16;

export type DigitValidator = (char: string) => boolean;

export type GuessResult = {
  bulls: number;
  cows: number;
};

export type Settings = {
  readonly length: number;
  readonly base: Base;
};

export type GuessEntry = {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
};

export type GameStatus = 'playing' | 'won';

export type GameState = {
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly GuessEntry[];
  readonly status: GameStatus;
  readonly startedAt: number;
  readonly finishedAt: number | null;
};

export type GameRecord = {
  readonly attempts: number;
  readonly time: number;
  readonly length: number;
  readonly base: Base;
  readonly date: number;
};
