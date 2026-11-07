export type Base = 2 | 8 | 10 | 16;

export type DigitValidator = (char: string) => boolean;

export type GuessResult = {
  bulls: number;
  cows: number;
};
