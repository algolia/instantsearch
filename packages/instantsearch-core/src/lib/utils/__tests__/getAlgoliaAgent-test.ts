import algoliasearchV4 from 'algoliasearch-v4';
import { algoliasearch as algoliasearchV5 } from 'algoliasearch-v5';

import { getAlgoliaAgent } from '../getAlgoliaAgent';

describe('getAlgoliaAgent', () => {
  it('should return the user agent for v5 clients', () => {
    expect(getAlgoliaAgent(algoliasearchV5('appId', 'apiKey'))).toMatch(
      /Algolia for JavaScript \(5\.\d+\.\d+(?:-[^)]+)?\)/
    );
  });

  it('should return the user agent for v4 clients', () => {
    expect(getAlgoliaAgent(algoliasearchV4('appId', 'apiKey'))).toMatch(
      /Algolia for JavaScript \(4\.\d+\.\d+(?:-[^)]+)?\)/
    );
  });
});
