import { deprecate, warning } from '../logger';

describe('deprecate', () => {
  const sum = (...args) => args.reduce((acc, _) => acc + _, 0);

  it('expect to call initial function and print message', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});
    const fn = deprecate(sum, 'message');

    const expectation = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation);
    expect(warn).toHaveBeenCalledWith('[InstantSearch.js]: message');

    warn.mockReset();
    warn.mockRestore();
  });

  it('expect to call initial function twice and print message once', () => {
    const warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});
    const fn = deprecate(sum, 'message');

    const expectation0 = fn(1, 2, 3);
    const expectation1 = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation0);
    expect(actual).toBe(expectation1);
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockReset();
    warn.mockRestore();
  });
});

describe('warning', () => {
  let warn;

  beforeEach(() => {
    warn = jest.spyOn(global.console, 'warn');
    warn.mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockReset();
    warn.mockRestore();
    warning.cache = {};
  });

  it('prints a warning message with a false condition', () => {
    warning(false, 'message');

    expect(warn).toHaveBeenCalledWith('[InstantSearch.js]: message');
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
