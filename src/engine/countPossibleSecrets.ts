import { memoize } from './memoize';

export const countPossibleSecrets: (length: number, base: number) => number =
  memoize((length, base) =>
    length === 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1),
  );
