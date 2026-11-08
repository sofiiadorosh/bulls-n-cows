type ElementOptions = {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
  children?: readonly (Node | string)[];
};

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  { className, text, attrs = {}, children = [] }: ElementOptions = {},
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  Object.entries(attrs).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  element.append(...children);

  return element;
};
