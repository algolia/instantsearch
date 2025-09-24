/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { getElements, getSettings } from '../get-information';

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('getSettings', () => {
  test('should return the settings', () => {
    document.head.innerHTML = `
      <meta name="algolia-configuration" content='{"appId":"appId","apiKey":"apiKey"}'>
    `;

    expect(getSettings()).toEqual({
      appId: 'appId',
      apiKey: 'apiKey',
      environment: 'prod',
    });

    document.head.innerHTML = `
      <meta name="algolia-configuration" content='{"appId":"appId","apiKey":"apiKey", "environment": "beta"}'>
    `;

    expect(getSettings()).toEqual({
      appId: 'appId',
      apiKey: 'apiKey',
      environment: 'beta',
    });
  });

  test('should throw if no meta tag found', () => {
    document.head.innerHTML = '';

    expect(() => getSettings()).toThrow('No meta tag found');
  });
});

describe('getElements', () => {
  test('should return the elements', () => {
    document.body.innerHTML = `
      <div data-experience-id="1"></div>
      <div data-experience-id="2"></div>
    `;

    expect(getElements()).toEqual(
      new Map([
        ['1', document.querySelector('[data-experience-id="1"]')!],
        ['2', document.querySelector('[data-experience-id="2"]')!],
      ])
    );
  });

  test('should return an empty map if no elements found', () => {
    document.body.innerHTML = '';

    expect(getElements()).toEqual(new Map());
  });
});
