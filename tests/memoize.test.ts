import { memoize } from '../src/engine/memoize';

describe('memoize', () => {
  it('returns the same result as the original function', () => {
    const add = (a: number, b: number) => a + b;
    const memoizedAdd = memoize(add);

    expect(memoizedAdd(2, 3)).toBe(5);
  });

  it('calls the original function only once for the same arguments', () => {
    const add = jest.fn((a: number, b: number) => a + b);
    const memoizedAdd = memoize(add);

    memoizedAdd(2, 3);
    memoizedAdd(2, 3);
    memoizedAdd(2, 3);

    expect(add).toHaveBeenCalledTimes(1);
  });

  it('calls the original function again for different arguments', () => {
    const add = jest.fn((a: number, b: number) => a + b);
    const memoizedAdd = memoize(add);

    memoizedAdd(2, 3);
    memoizedAdd(4, 5);

    expect(add).toHaveBeenCalledTimes(2);
  });

  it('treats arguments in a different order as different calls', () => {
    const subtract = jest.fn((a: number, b: number) => a - b);
    const memoizedSubtract = memoize(subtract);

    expect(memoizedSubtract(5, 2)).toBe(3);
    expect(memoizedSubtract(2, 5)).toBe(-3);
    expect(subtract).toHaveBeenCalledTimes(2);
  });

  it('returns the cached result on repeated calls', () => {
    const add = jest.fn((a: number, b: number) => a + b);
    const memoizedAdd = memoize(add);

    const first = memoizedAdd(2, 3);
    const second = memoizedAdd(2, 3);

    expect(second).toBe(first);
  });

  it('keeps a separate cache for each memoized function', () => {
    const add = jest.fn((a: number, b: number) => a + b);
    const memoizedA = memoize(add);
    const memoizedB = memoize(add);

    memoizedA(2, 3);
    memoizedB(2, 3);

    expect(add).toHaveBeenCalledTimes(2);
  });
});
