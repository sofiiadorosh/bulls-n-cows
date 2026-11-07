import { LENGTHS } from './constants';
import type { Base } from './types';

export const getAvailableLengths = (base: Base): number[] =>
  LENGTHS.filter((length) => length <= base);
