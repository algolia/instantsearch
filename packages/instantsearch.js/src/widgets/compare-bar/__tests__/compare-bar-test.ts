/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import compareBar from '../compare-bar';

import type { CompareBarWidgetParams } from '../compare-bar';

describe('compareBar', () => {
  describe('usage', () => {
    it('throws without container', () => {
      expect(() =>
        // @ts-expect-error
        compareBar({ configurationId: 'algolia_comparison_abc' })
      ).toThrow(/The `container` option is required/);
    });

    it('throws without configurationId', () => {
      expect(() =>
        // @ts-expect-error
        compareBar({ container: document.createElement('div') })
      ).toThrow(/The `configurationId` option is required/);
    });

    it('throws with an empty configurationId', () => {
      expect(() =>
        compareBar({
          container: document.createElement('div'),
          configurationId: '',
        } as CompareBarWidgetParams)
      ).toThrow(/The `configurationId` option is required/);
    });

    it('does not throw with container and configurationId', () => {
      expect(() =>
        compareBar({
          container: document.createElement('div'),
          configurationId: 'algolia_comparison_abc',
        })
      ).not.toThrow();
    });
  });
});
