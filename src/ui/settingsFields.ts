import { BASE_NAMES, BASES, LENGTHS } from '../core/constants';
import { getAvailableLengths } from '../core/getAvailableLengths';
import { normalizeSettings, parseBase } from '../core/settings';
import type { Settings } from '../core/types';
import { createElement } from './dom';
import { createDropdown } from './dropdown';

type SettingsFieldsOptions = {
  settings: Settings;
  disabled?: boolean;
  onChange?: (settings: Settings) => void;
};

export const createSettingsFields = ({
  settings,
  disabled = false,
  onChange,
}: SettingsFieldsOptions): HTMLElement => {
  let current = settings;

  const update = (next: Settings): void => {
    current = normalizeSettings(next);
    show(current);
    onChange?.(current);
  };

  const baseDropdown = createDropdown({
    label: 'Base',
    value: String(settings.base),
    disabled,
    options: BASES.map((base) => ({
      value: String(base),
      label: `${BASE_NAMES[base]} (${base})`,
    })),
    onChange: (value) =>
      update({ ...current, base: parseBase(value) ?? current.base }),
  });

  const lengthDropdown = createDropdown({
    label: 'Length',
    value: String(settings.length),
    disabled,
    options: LENGTHS.map((length) => ({
      value: String(length),
      label: String(length),
    })),
    onChange: (value) => update({ ...current, length: Number(value) }),
  });

  const show = ({ base, length }: Settings): void => {
    const available = getAvailableLengths(base);

    lengthDropdown.setDisabledValues(
      LENGTHS.filter((item) => !available.includes(item)).map(String),
    );
    lengthDropdown.setValue(String(length));
  };

  show(settings);

  return createElement('div', {
    className: 'settings__fields',
    children: [baseDropdown.element, lengthDropdown.element],
  });
};
