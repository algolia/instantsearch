/* eslint-env jest, jasmine */

import createStateManager from './createStateManager';
jest.unmock('./createStateManager');
jest.unmock('algoliasearch-helper');
jest.unmock('algoliasearch-helper/src/url');

describe('createStateManager', () => {
  it('retrieves the initial state from the URL', () => {
    const stateManager = createStateManager({
      listen: listener => {
        listener({
          search: '?q=hellooo',
        });
      },
    }, () => null);

    expect(stateManager.getState().query).toBe('hellooo');
  });
});
