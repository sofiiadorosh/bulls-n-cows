import type { GameRecord, Settings } from '../core/types';
import { countPossibleSecrets } from '../engine/countPossibleSecrets';
import { createElement } from './dom';
import { createRecordsTable } from './recordsTable';
import { createSettingsFields } from './settingsFields';
import { createDigitTiles, createHeader, createPill } from './tiles';

type SettingsScreenOptions = {
  settings: Settings;
  records: readonly GameRecord[];
  onStart: (settings: Settings) => void;
};

const formatPossibleSecrets = ({ length, base }: Settings): string =>
  `Possible secrets: ${countPossibleSecrets(length, base).toLocaleString('en-US')}`;

const createRules = (): HTMLElement =>
  createElement('div', {
    className: 'card rules',
    children: [
      createElement('h2', { text: 'Can you crack the code?' }),
      createElement('p', {
        className: 'hint',
        text: 'The computer hides a number made of unique digits. After every guess you get a hint:',
      }),
      createElement('div', {
        className: 'rules__example',
        children: [
          createElement('span', {
            className: 'rules__label',
            text: 'Secret',
          }),
          createDigitTiles('1234'),
          createElement('span', { className: 'rules__label', text: 'Guess' }),
          createDigitTiles('1325'),
        ],
      }),
      createElement('p', {
        className: 'rules__legend',
        children: [
          createPill('1 bull', 'bull'),
          ' right digit in the right place (1)',
        ],
      }),
      createElement('p', {
        className: 'rules__legend',
        children: [
          createPill('2 cows', 'cow'),
          ' right digits in the wrong place (2 and 3)',
        ],
      }),
    ],
  });

export const createSettingsScreen = ({
  settings,
  records,
  onStart,
}: SettingsScreenOptions): HTMLElement[] => {
  let current = settings;

  const possibleSecrets = createElement('p', {
    className: 'hint',
    text: formatPossibleSecrets(current),
  });

  const fields = createSettingsFields({
    settings,
    onChange: (next) => {
      current = next;
      possibleSecrets.textContent = formatPossibleSecrets(current);
    },
  });

  const form = createElement('form', {
    className: 'card settings',
    children: [
      createElement('h2', { text: 'Settings' }),
      fields,
      possibleSecrets,
      createElement('button', {
        className: 'button',
        text: 'Start game',
        attrs: { type: 'submit' },
      }),
    ],
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onStart(current);
  });

  return [
    createHeader({ bannerText: 'The classic code-breaking challenge' }),
    createRules(),
    form,
    createRecordsTable(records),
  ];
};
