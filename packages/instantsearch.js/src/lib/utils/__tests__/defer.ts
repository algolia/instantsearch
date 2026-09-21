import { defer } from '../defer';

describe('defer', () => {
  // Joins the pending and the next arguments so a single assertion on the
  // callback shows the whole fold, not just the last pair.
  const joinArguments = ([pending]: [string], [next]: [string]): [string] => [
    `${pending}+${next}`,
  ];

  it('defers the call to the function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('deduplicates the calls to the function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();
    deferred();
    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('deduplicates the calls only until the next microtask', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();
    deferred();
    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);

    deferred();
    deferred();
    deferred();

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancels the deferred function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred.cancel();

    expect(fn).toHaveBeenCalledTimes(0);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('cancels only the current deferred function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred.cancel();

    expect(fn).toHaveBeenCalledTimes(0);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred();

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancels only the running deferred function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred.cancel();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws an error when `wait` is called before the deferred function', () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    expect(() => deferred.wait()).toThrowErrorMatchingInlineSnapshot(
      `"The deferred function should be called before calling \`wait()\`"`
    );
  });

  it('recovers a deferred function that throws an error', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    fn.mockImplementation(() => {
      throw new Error('FAIL');
    });

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    try {
      await deferred.wait();
    } catch {
      // The test verifies that the function is able to recover. We don't want
      // to terminate the test on this expected error.
    }

    expect(fn).toHaveBeenCalledTimes(1);

    fn.mockImplementation();

    deferred();

    expect(fn).toHaveBeenCalledTimes(1);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('keeps the arguments of the first call of the window', async () => {
    const fn = jest.fn((value: string) => value);
    const deferred = defer(fn);

    deferred('first');
    deferred('second');
    deferred('third');

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');
  });

  it('folds the arguments of later calls with `mergeArguments`', async () => {
    const fn = jest.fn((value: string) => value);
    const mergeArguments = jest.fn(joinArguments);
    const deferred = defer(fn, mergeArguments);

    deferred('a');
    deferred('b');
    deferred('c');

    await deferred.wait();

    // The merger folds the pending arguments with the next ones, so the third
    // call sees the result of the second fold rather than the original call.
    expect(mergeArguments).toHaveBeenCalledTimes(2);
    expect(mergeArguments).toHaveBeenNthCalledWith(1, ['a'], ['b']);
    expect(mergeArguments).toHaveBeenNthCalledWith(2, ['a+b'], ['c']);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a+b+c');
  });

  it('does not call `mergeArguments` for a window of one call', async () => {
    const fn = jest.fn((value: string) => value);
    const mergeArguments = jest.fn(joinArguments);
    const deferred = defer(fn, mergeArguments);

    deferred('only');

    await deferred.wait();

    expect(mergeArguments).not.toHaveBeenCalled();
    expect(fn).toHaveBeenCalledWith('only');
  });

  it('starts every window from the arguments of its own first call', async () => {
    const fn = jest.fn((value: string) => value);
    const mergeArguments = jest.fn(joinArguments);
    const deferred = defer(fn, mergeArguments);

    deferred('a');
    deferred('b');

    await deferred.wait();

    expect(fn).toHaveBeenNthCalledWith(1, 'a+b');

    deferred('c');
    deferred('d');

    await deferred.wait();

    // The second window folds `c` with `d`, not the previous window's result.
    expect(mergeArguments).toHaveBeenNthCalledWith(2, ['c'], ['d']);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, 'c+d');
  });

  it('cancels a merged run and leaves no arguments behind', async () => {
    const fn = jest.fn((value: string) => value);
    const mergeArguments = jest.fn(joinArguments);
    const deferred = defer(fn, mergeArguments);

    deferred('a');
    deferred('b');
    deferred.cancel();

    await deferred.wait();

    expect(mergeArguments).toHaveBeenCalledTimes(1);
    expect(fn).not.toHaveBeenCalled();

    deferred('c');

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('merges every argument of a multi-argument callback', async () => {
    const fn = jest.fn((label: string, count: number) => `${label}${count}`);
    const deferred = defer(
      fn,
      ([label, count], [nextLabel, nextCount]): [string, number] => [
        `${label}|${nextLabel}`,
        count + nextCount,
      ]
    );

    deferred('a', 1);
    deferred('b', 2);
    deferred('c', 3);

    await deferred.wait();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a|b|c', 6);
  });
});
