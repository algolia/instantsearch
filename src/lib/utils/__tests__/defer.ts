import defer from '../defer';

describe('defer', () => {
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
});
