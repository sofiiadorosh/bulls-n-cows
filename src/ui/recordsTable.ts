import { formatSettings, formatTime } from '../core/format';
import type { GameRecord } from '../core/types';
import { createElement } from './dom';

const COLUMNS = ['#', 'Attempts', 'Time', 'Settings', 'Date'];

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString();

const createCell = (content: string | Node): HTMLDivElement =>
  createElement('div', {
    className: 'records__cell',
    attrs: { role: 'cell' },
    children: [content],
  });

const createHeaderRow = (): HTMLDivElement =>
  createElement('div', {
    className: 'records__row records__row_header',
    attrs: { role: 'row' },
    children: COLUMNS.map((column) =>
      createElement('div', {
        className: 'records__cell',
        text: column,
        attrs: { role: 'columnheader' },
      }),
    ),
  });

const createRecordRow = (
  record: GameRecord,
  index: number,
  highlighted: GameRecord | null,
): HTMLDivElement =>
  createElement('div', {
    className:
      record === highlighted
        ? 'records__row records__row_highlighted'
        : 'records__row',
    attrs: { role: 'row' },
    children: [
      createCell(String(index + 1)),
      createCell(String(record.attempts)),
      createCell(formatTime(record.time)),
      createCell(
        createElement('span', {
          className: 'badge',
          text: formatSettings(record),
        }),
      ),
      createCell(formatDate(record.date)),
    ],
  });

export const createRecordsTable = (
  records: readonly GameRecord[],
  highlighted: GameRecord | null = null,
): HTMLElement => {
  const heading = createElement('h2', { text: 'Records' });

  if (records.length === 0) {
    return createElement('div', {
      className: 'card',
      children: [
        heading,
        createElement('p', {
          className: 'hint',
          text: 'No records yet. Win a game to get on the board!',
        }),
      ],
    });
  }

  const rows = records.map((record, index) =>
    createRecordRow(record, index, highlighted),
  );

  return createElement('div', {
    className: 'card',
    children: [
      heading,
      createElement('div', {
        className: 'records',
        attrs: { role: 'table', 'aria-label': 'Records' },
        children: [createHeaderRow(), ...rows],
      }),
    ],
  });
};
