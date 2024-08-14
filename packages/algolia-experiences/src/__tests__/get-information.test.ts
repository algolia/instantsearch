/**
 * @jest-environment jsdom
 */
import { getElements, getSettings } from '../get-information';

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('getSettings', () => {
  test('should return the settings', () => {
    document.head.innerHTML = `
      <meta name="instantsearch-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    expect(getSettings()).toEqual({ appId: 'appId', apiKey: 'apiKey' });
  });

  test('should throw if no meta tag found', () => {
    document.head.innerHTML = '';

    expect(() => getSettings()).toThrow('No meta tag found');
  });
});

describe('getElements', () => {
  test('should return the elements', () => {
    document.body.innerHTML = `
      <div data-instantsearch-id="1"></div>
      <div data-instantsearch-id="2"></div>
    `;

    expect(getElements()).toEqual(
      new Map([
        ['1', document.querySelector('[data-instantsearch-id="1"]')!],
        ['2', document.querySelector('[data-instantsearch-id="2"]')!],
      ])
    );
  });

  test('should return an empty map if no elements found', () => {
    document.body.innerHTML = '';

    expect(getElements()).toEqual(new Map());
  });
});
