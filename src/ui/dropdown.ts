import { createElement } from './dom';

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownOptions = {
  label: string;
  options: readonly DropdownOption[];
  value: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export type Dropdown = {
  element: HTMLElement;
  setValue: (value: string) => void;
  setDisabledValues: (values: readonly string[]) => void;
};

let dropdownCount = 0;

export const createDropdown = ({
  label,
  options,
  value,
  disabled = false,
  onChange,
}: DropdownOptions): Dropdown => {
  dropdownCount += 1;
  const id = `dropdown-${dropdownCount}`;

  let selectedValue = value;
  let activeIndex = -1;
  let disabledValues: readonly string[] = [];

  const labelElement = createElement('span', {
    className: 'dropdown__label',
    text: label,
    attrs: { id: `${id}-label` },
  });

  const valueElement = createElement('span', {
    className: 'dropdown__value',
    attrs: { id: `${id}-value` },
  });

  const button = createElement('button', {
    className: 'dropdown__button',
    attrs: {
      type: 'button',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-labelledby': `${id}-label ${id}-value`,
    },
    children: [
      valueElement,
      createElement('span', {
        className: 'dropdown__arrow',
        attrs: { 'aria-hidden': 'true' },
      }),
    ],
  });

  const optionElements = options.map((option, index) =>
    createElement('li', {
      className: 'dropdown__option',
      text: option.label,
      attrs: {
        id: `${id}-option-${index}`,
        role: 'option',
        'aria-selected': 'false',
      },
    }),
  );

  const list = createElement('ul', {
    className: 'dropdown__list',
    attrs: {
      role: 'listbox',
      tabindex: '-1',
      'aria-labelledby': `${id}-label`,
    },
    children: optionElements,
  });

  const element = createElement('div', {
    className: 'dropdown',
    children: [labelElement, button, list],
  });

  const isDisabledIndex = (index: number): boolean =>
    disabledValues.includes(options[index].value);

  const findEnabledIndex = (from: number, step: number): number => {
    const index = from + step;

    if (index < 0 || index >= options.length) {
      return from;
    }

    return isDisabledIndex(index) ? findEnabledIndex(index, step) : index;
  };

  const paintOptions = (): void => {
    optionElements.forEach((optionElement, index) => {
      const isSelected = options[index].value === selectedValue;
      const isDisabled = isDisabledIndex(index);

      optionElement.classList.toggle('dropdown__option_selected', isSelected);
      optionElement.classList.toggle(
        'dropdown__option_active',
        index === activeIndex,
      );
      optionElement.classList.toggle('dropdown__option_disabled', isDisabled);
      optionElement.setAttribute('aria-selected', String(isSelected));
      optionElement.setAttribute('aria-disabled', String(isDisabled));
    });

    if (activeIndex >= 0) {
      list.setAttribute(
        'aria-activedescendant',
        optionElements[activeIndex].id,
      );
    } else {
      list.removeAttribute('aria-activedescendant');
    }

    const selected = options.find((option) => option.value === selectedValue);
    valueElement.textContent = selected ? selected.label : '';
  };

  const isOpen = (): boolean => element.classList.contains('dropdown_open');

  const open = (): void => {
    if (button.disabled) {
      return;
    }

    activeIndex = options.findIndex((option) => option.value === selectedValue);
    element.classList.add('dropdown_open');
    button.setAttribute('aria-expanded', 'true');
    paintOptions();
    list.focus();
  };

  const close = (shouldFocusButton: boolean): void => {
    element.classList.remove('dropdown_open');
    button.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
    paintOptions();

    if (shouldFocusButton) {
      button.focus();
    }
  };

  const select = (index: number): void => {
    if (isDisabledIndex(index)) {
      return;
    }

    const nextValue = options[index].value;
    const hasChanged = nextValue !== selectedValue;

    selectedValue = nextValue;
    close(true);

    if (hasChanged) {
      onChange?.(nextValue);
    }
  };

  const moveActive = (index: number): void => {
    activeIndex = index;
    paintOptions();
    optionElements[index].scrollIntoView({ block: 'nearest' });
  };

  button.addEventListener('click', () => {
    if (isOpen()) {
      close(true);
    } else {
      open();
    }
  });

  button.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      open();
    }
  });

  list.addEventListener('keydown', (event) => {
    const lastIndex = options.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(findEnabledIndex(activeIndex, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(findEnabledIndex(activeIndex, -1));
        break;
      case 'Home':
        event.preventDefault();
        moveActive(findEnabledIndex(-1, 1));
        break;
      case 'End':
        event.preventDefault();
        moveActive(findEnabledIndex(lastIndex + 1, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
      default:
        break;
    }
  });

  optionElements.forEach((optionElement, index) => {
    optionElement.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });

    optionElement.addEventListener('click', () => {
      select(index);
    });

    optionElement.addEventListener('mousemove', () => {
      if (!isDisabledIndex(index) && index !== activeIndex) {
        moveActive(index);
      }
    });
  });

  element.addEventListener('focusout', (event) => {
    const nextFocus = event.relatedTarget;

    if (!(nextFocus instanceof Node) || !element.contains(nextFocus)) {
      close(false);
    }
  });

  button.disabled = disabled;
  paintOptions();

  return {
    element,
    setValue: (nextValue) => {
      selectedValue = nextValue;
      paintOptions();
    },
    setDisabledValues: (values) => {
      disabledValues = values;
      paintOptions();
    },
  };
};
