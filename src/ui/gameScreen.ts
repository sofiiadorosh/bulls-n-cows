import { formatTime, pluralize } from '../core/format';
import { getAttempts, getElapsedTime, hasGuessed } from '../core/game';
import { filterGuessInput } from '../core/input';
import type { GameRecord, GameState, GuessEntry } from '../core/types';
import { createDigitValidator } from '../engine/createDigitValidator';
import { isValidGuess } from '../engine/isValidGuess';
import { createElement } from './dom';
import { createRecordsTable } from './recordsTable';
import { createSettingsFields } from './settingsFields';
import { createDigitTiles, createHeader, createPill } from './tiles';

type GameScreenOptions = {
  game: GameState;
  records: readonly GameRecord[];
  newRecord: GameRecord | null;
  onGuess: (guess: string) => void;
  onNewGame: () => void;
};

export type GameView = {
  elements: HTMLElement[];
  tick: () => void;
};

const createHistory = (history: readonly GuessEntry[]): HTMLElement =>
  history.length === 0
    ? createElement('p', { className: 'hint', text: 'No guesses yet.' })
    : createElement('ol', {
        className: 'history',
        children: history.map((entry) =>
          createElement('li', {
            className: 'history__item',
            children: [
              createDigitTiles(entry.guess),
              createElement('span', {
                className: 'history__result',
                children: [
                  createPill(pluralize(entry.bulls, 'bull'), 'bull'),
                  createPill(pluralize(entry.cows, 'cow'), 'cow'),
                ],
              }),
            ],
          }),
        ),
      });

const createGuessForm = (
  game: GameState,
  onGuess: (guess: string) => void,
): HTMLFormElement => {
  const { settings } = game;
  const isDigit = createDigitValidator(settings.base);

  const message = createElement('p', {
    className: 'guess__message',
    attrs: { role: 'status' },
  });

  const input = createElement('input', {
    className: 'guess__input',
    attrs: {
      type: 'text',
      inputmode: settings.base === 16 ? 'text' : 'numeric',
      autocomplete: 'off',
      spellcheck: 'false',
      placeholder: `${settings.length} unique digits`,
      'aria-label': 'Your guess',
    },
  });

  input.addEventListener('input', () => {
    const filtered = filterGuessInput(input.value, isDigit, settings.length);

    if (filtered !== input.value) {
      input.value = filtered;
    }

    message.textContent = '';
  });

  const form = createElement('form', {
    className: 'guess',
    children: [
      input,
      createElement('button', {
        className: 'button',
        text: 'Guess',
        attrs: { type: 'submit' },
      }),
      message,
    ],
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const guess = input.value;

    if (!isValidGuess(guess, settings.length, settings.base)) {
      message.textContent = `Enter ${settings.length} unique digits.`;
      return;
    }

    if (hasGuessed(game, guess)) {
      message.textContent = `You have already tried ${guess.toLowerCase()}.`;
      input.select();
      return;
    }

    onGuess(guess);
  });

  queueMicrotask(() => input.focus());

  return form;
};

const createWinPanel = (
  game: GameState,
  records: readonly GameRecord[],
  newRecord: GameRecord | null,
): HTMLElement[] => [
  createElement('div', {
    className: 'card win',
    children: [
      createElement('h2', { text: 'You cracked the code!' }),
      createDigitTiles(game.secret),
      createElement('p', {
        className: 'win__text',
        text: `Attempts: ${getAttempts(game)} · Time: ${formatTime(getElapsedTime(game))}`,
      }),
      createElement('p', {
        className: 'win__text',
        text: newRecord
          ? 'New entry in the records table!'
          : 'Not in the top this time.',
      }),
    ],
  }),
  createRecordsTable(records, newRecord),
];

export const createGameScreen = ({
  game,
  records,
  newRecord,
  onGuess,
  onNewGame,
}: GameScreenOptions): GameView => {
  const timer = createElement('span', { className: 'timer' });

  const tick = (): void => {
    timer.textContent = formatTime(getElapsedTime(game));
  };

  const newGameButton = createElement('button', {
    className: 'button button_secondary',
    text: 'New game',
    attrs: { type: 'button' },
  });

  newGameButton.addEventListener('click', onNewGame);

  const board = createElement('div', {
    className: 'card board',
    children: [
      createElement('div', {
        className: 'board__stats',
        children: [
          createElement('span', {
            text: `Attempts: ${getAttempts(game)}`,
          }),
          createElement('span', { children: ['Time: ', timer] }),
        ],
      }),
      ...(game.status === 'playing' ? [createGuessForm(game, onGuess)] : []),
      createHistory(game.history),
    ],
  });

  tick();

  return {
    elements: [
      createHeader({ isSmall: true }),
      createElement('div', {
        className: 'card',
        children: [
          createSettingsFields({ settings: game.settings, disabled: true }),
          createElement('p', {
            className: 'hint settings__locked',
            text: 'Settings are locked. Press “New game” to change them.',
          }),
        ],
      }),
      ...(game.status === 'won'
        ? createWinPanel(game, records, newRecord)
        : []),
      board,
      newGameButton,
    ],
    tick,
  };
};
