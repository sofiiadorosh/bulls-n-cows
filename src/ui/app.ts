import { DEFAULT_SETTINGS } from '../core/constants';
import { createGame, makeGuess } from '../core/game';
import { addRecord, createRecord } from '../core/records';
import type { GameRecord, GameState, Settings } from '../core/types';
import { loadRecords, saveRecords } from '../storage/recordsStorage';
import { createElement } from './dom';
import { createGameScreen } from './gameScreen';
import { createSettingsScreen } from './settingsScreen';

type Screen =
  | { readonly name: 'settings'; readonly settings: Settings }
  | {
      readonly name: 'game';
      readonly game: GameState;
      readonly newRecord: GameRecord | null;
    };

export const startApp = (root: HTMLElement): void => {
  const container = createElement('div', {
    className: 'container screen__container',
  });

  let screen: Screen = { name: 'settings', settings: DEFAULT_SETTINGS };
  let records = loadRecords();
  let timerId: number | undefined;

  const show = (next: Screen): void => {
    screen = next;
    render();
  };

  const handleStart = (settings: Settings): void => {
    show({ name: 'game', game: createGame(settings), newRecord: null });
  };

  const handleGuess = (guess: string): void => {
    const current = screen;

    if (current.name !== 'game') {
      return;
    }

    const game = makeGuess(current.game, guess);
    const record = createRecord(game);

    if (record) {
      records = addRecord(records, record);
      saveRecords(records);
    }

    show({
      name: 'game',
      game,
      newRecord: record && records.includes(record) ? record : null,
    });
  };

  const handleNewGame = (): void => {
    const current = screen;

    if (current.name === 'game') {
      show({ name: 'settings', settings: current.game.settings });
    }
  };

  const render = (): void => {
    window.clearInterval(timerId);

    if (screen.name === 'settings') {
      container.replaceChildren(
        ...createSettingsScreen({
          settings: screen.settings,
          records,
          onStart: handleStart,
        }),
      );
      return;
    }

    const view = createGameScreen({
      game: screen.game,
      records,
      newRecord: screen.newRecord,
      onGuess: handleGuess,
      onNewGame: handleNewGame,
    });

    container.replaceChildren(...view.elements);

    if (screen.game.status === 'playing') {
      timerId = window.setInterval(view.tick, 1000);
    }
  };

  root.replaceChildren(
    createElement('section', { className: 'screen', children: [container] }),
  );
  render();
};
