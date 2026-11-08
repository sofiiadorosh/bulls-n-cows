import { RECORDS_LIMIT } from './constants';
import type { GameRecord, GameState } from './types';

export const createRecord = (state: GameState): GameRecord | null =>
  state.status === 'won' && state.finishedAt !== null
    ? {
        attempts: state.history.length,
        time: state.finishedAt - state.startedAt,
        length: state.settings.length,
        base: state.settings.base,
        date: state.finishedAt,
      }
    : null;

export const compareRecords = (a: GameRecord, b: GameRecord): number =>
  a.attempts - b.attempts || a.time - b.time;

export const addRecord = (
  records: readonly GameRecord[],
  record: GameRecord,
  limit: number = RECORDS_LIMIT,
): GameRecord[] => [...records, record].sort(compareRecords).slice(0, limit);
