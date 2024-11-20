import { deprecate, warning, warnCache } from '..';

describe('deprecate', () => {
  const sum = (...args: number[]) => args.reduce((acc, _) => acc + _, 0);
  let warn: jest.SpiedFunction<typeof global.console.warn>;

  beforeEach(() => {
    warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockReset();
    warn.mockRestore();
  });

  it('expect to call initial function and print message', () => {
    const fn = deprecate(sum, 'message');

    const expectation = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation);
    expect(warn).toHaveBeenCalledWith('[InstantSearch]: message');
  });

  it('expect to call initial function twice and print message once', () => {
    const fn = deprecate(sum, 'message');

    const expectation0 = fn(1, 2, 3);
    const expectation1 = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation0);
    expect(actual).toBe(expectation1);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('warning', () => {
  let warn: jest.SpiedFunction<typeof global.console.warn>;

  beforeEach(() => {
    warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockReset();
    warn.mockRestore();
    warnCache.current = {};
  });

  it('prints a warning message with a false condition', () => {
    warning(false, 'message');

    expect(warn).toHaveBeenCalledWith('[InstantSearch]: message');
  });

  it('does not print a warning message with a true condition', () => {
    warning(true, 'message');

    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('prints the same warning message only once', () => {
    warning(false, 'message');
    expect(warn).toHaveBeenCalledTimes(1);

    warning(false, 'message');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
