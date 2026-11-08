import { createElement } from './dom';

const TILE_COLORS = ['red', 'blue', 'green', 'purple', 'orange'];

const createTile = (char: string, className: string): HTMLSpanElement =>
  createElement('span', { className: `tile ${className}`, text: char });

const createColorfulWord = (word: string): HTMLSpanElement =>
  createElement('span', {
    className: 'title__row',
    attrs: { 'aria-hidden': 'true' },
    children: [...word].map((char, index) =>
      createTile(char, `tile_${TILE_COLORS[index % TILE_COLORS.length]}`),
    ),
  });

const createPlainWord = (word: string, accent: string): HTMLSpanElement =>
  createElement('span', {
    className: 'title__row',
    attrs: { 'aria-hidden': 'true' },
    children: [
      createTile(accent, 'tile_pink'),
      ...[...word].map((char) => createTile(char, 'tile_white')),
    ],
  });

const createTitle = (isSmall: boolean): HTMLElement =>
  createElement('h1', {
    className: isSmall ? 'title title_small' : 'title',
    attrs: { 'aria-label': 'Bulls n Cows' },
    children: [createColorfulWord('BULLS'), createPlainWord('COWS', 'n')],
  });

const createBanner = (text: string): HTMLElement =>
  createElement('p', { className: 'banner', text });

export const createDigitTiles = (value: string): HTMLSpanElement =>
  createElement('span', {
    className: 'digit-tiles',
    attrs: { 'aria-label': value },
    children: [...value].map((char) =>
      createElement('span', {
        className: 'digit-tiles__tile',
        text: char,
        attrs: { 'aria-hidden': 'true' },
      }),
    ),
  });

export const createPill = (text: string, variant: string): HTMLSpanElement =>
  createElement('span', { className: `pill pill_${variant}`, text });

type HeaderOptions = {
  isSmall?: boolean;
  bannerText?: string;
};

export const createHeader = ({
  isSmall = false,
  bannerText,
}: HeaderOptions = {}): HTMLElement =>
  createElement('div', {
    className: 'header',
    children: [
      createTitle(isSmall),
      ...(bannerText ? [createBanner(bannerText)] : []),
    ],
  });
