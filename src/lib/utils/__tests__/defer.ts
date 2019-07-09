import defer from '../defer';

describe('defer', () => {
  it('defers the call to the function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('deduplicates the calls to the function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();
    deferred();
    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('deduplicates the calls only until the next microtask', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();
    deferred();
    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);

    deferred();
    deferred();
    deferred();

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancels the deferred function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred.cancel();

    expect(fn).toHaveBeenCalledTimes(0);

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('cancels only the current deferred function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred.cancel();

    expect(fn).toHaveBeenCalledTimes(0);

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred();

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancels only the running deferred function', async () => {
    const fn = jest.fn();
    const deferred = defer(fn);

    deferred.cancel();

    expect(fn).toHaveBeenCalledTimes(0);

    deferred();

    expect(fn).toHaveBeenCalledTimes(0);

    await Promise.resolve();

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
