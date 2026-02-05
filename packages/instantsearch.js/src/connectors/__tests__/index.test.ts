/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import * as connectors from '..';
import * as connectorsUmd from '../index.umd';

describe('connectors', () => {
  describe('umd', () => {
    test('has the same number of exports as the main entrypoint', () => {
      expect(Object.keys(connectorsUmd)).toEqual(Object.keys(connectors));
    });
  });
});
