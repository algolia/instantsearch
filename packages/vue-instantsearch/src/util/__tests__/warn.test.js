import { warn } from '../warn';
const noop = () => {};

it('calls console.warn first time', () => {
  const spy = jest.spyOn(console, 'warn').mockImplementation(noop);
  warn('hello this is my warning');
  expect(spy).toHaveBeenCalledTimes(1);
});

it("doesn't call console.warn second time", () => {
  const spy = jest.spyOn(console, 'warn').mockImplementation(noop);
  warn('hello this is my warning');
  warn('hello this is my warning');
  expect(spy).toHaveBeenCalledTimes(1);
});

it('calls console.warn for each message', () => {
  const spy = jest.spyOn(console, 'warn').mockImplementation(noop);
  warn('hello this is my warning');
  warn('hello this is my other warning');
  expect(spy).toHaveBeenCalledTimes(2);
});

it('calls console.warn for each message once', () => {
  const spy = jest.spyOn(console, 'warn').mockImplementation(noop);
  warn('hello this is my warning');
  warn('hello this is my other warning');
  warn('hello this is my other warning');
  warn('hello this is my other warning');
  expect(spy).toHaveBeenCalledTimes(2);
});
