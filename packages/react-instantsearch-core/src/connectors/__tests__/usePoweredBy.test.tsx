/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { usePoweredBy } from '../usePoweredBy';

describe('usePoweredBy', () => {
  test('returns the connector render state', () => {
    const { url } = usePoweredBy();

    expect(url).toBe(
      `https://www.algolia.com/?utm_source=react-instantsearch&utm_medium=website&utm_content=localhost&utm_campaign=poweredby`
    );
  });

  test('does not set `utm_content` when `window.location` is not defined', () => {
    const originalWindow = { ...window };
    const windowSpy = jest.spyOn(global, 'window', 'get');
    const { location, ...windowWithoutLocation } = originalWindow;
    // @ts-expect-error
    windowSpy.mockImplementation(() => windowWithoutLocation);

    const { url } = usePoweredBy();

    expect(url).toBe(
      `https://www.algolia.com/?utm_source=react-instantsearch&utm_medium=website&utm_content=&utm_campaign=poweredby`
    );

    windowSpy.mockRestore();
  });
});
