import { BASE_NAMES } from './constants';
import type { Settings } from './types';

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const formatSettings = ({ length, base }: Settings): string =>
  `${length} · ${BASE_NAMES[base]}`;
