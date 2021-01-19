import { debounce, debounceAsync } from '../debounce';

describe('debounce', () => {
  it('debounces the function', done => {
    const originalFunction = jest.fn();
    const debouncedFunction = debounce(originalFunction, 100);
    debouncedFunction('a');
    debouncedFunction('b');

    setTimeout(() => {
      expect(originalFunction).toHaveBeenCalledTimes(1);
      expect(originalFunction).toHaveBeenLastCalledWith('b');
      done();
    }, 100);
  });

  it('executes all the calls if they are not within the debounce time', done => {
    const originalFunction = jest.fn();
    const debouncedFunction = debounce(originalFunction, 100);

    debouncedFunction('a');

    setTimeout(() => {
      debouncedFunction('b');
    }, 100);

    setTimeout(() => {
      expect(originalFunction).toHaveBeenCalledTimes(2);
      expect(originalFunction).toHaveBeenLastCalledWith('b');
      done();
    }, 250);
  });
});

describe('debounceAsync', () => {
  it('returns a promise', async () => {
    const originalFunction = jest.fn(x => Promise.resolve(x));
    const debouncedFunction = debounceAsync(originalFunction, 100);
    const promise1 = debouncedFunction('a');
    const promise2 = debouncedFunction('b');

    await expect(promise1).rejects.toEqual(undefined);
    await expect(promise2).resolves.toEqual('b');

    expect(originalFunction).toHaveBeenCalledTimes(1);
    expect(originalFunction).toHaveBeenLastCalledWith('b');
  });

  it('returns a promise with a resolved data', async () => {
    const originalFunction = () => Promise.resolve('abc');

    const debouncedFunction = debounceAsync(originalFunction, 100);
    const promise = debouncedFunction();
    const ret = await promise;
    expect(ret).toEqual('abc');
  });

  it('accepts synchronous function as well', async () => {
    const originalFunction = jest.fn(x => x);
    const debouncedFunction = debounceAsync(originalFunction, 100);
    const promise = debouncedFunction('a');

    await expect(promise).resolves.toEqual('a');
  });
});
