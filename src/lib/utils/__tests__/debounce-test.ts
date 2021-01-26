import { debounce } from '../debounce';

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

  it('returns a promise', async () => {
    const originalFunction = jest.fn(x => Promise.resolve(x));
    const debouncedFunction = debounce(originalFunction, 100);

    debouncedFunction('a');

    const promise = debouncedFunction('b');
    await expect(promise).resolves.toEqual('b');

    expect(originalFunction).toHaveBeenCalledTimes(1);
    expect(originalFunction).toHaveBeenLastCalledWith('b');
  });

  it('returns a promise with a resolved data', async () => {
    type OriginalFunction = () => Promise<'abc'>;
    const originalFunction: OriginalFunction = () => Promise.resolve('abc');

    const debouncedFunction = debounce<OriginalFunction>(originalFunction, 100);
    const promise = debouncedFunction();
    const ret = await promise;
    expect(ret).toEqual('abc');
  });

  it('accepts synchronous function as well', async () => {
    const originalFunction = jest.fn(x => x);
    const debouncedFunction = debounce(originalFunction, 100);
    const promise = debouncedFunction('a');

    await expect(promise).resolves.toEqual('a');
  });
});
