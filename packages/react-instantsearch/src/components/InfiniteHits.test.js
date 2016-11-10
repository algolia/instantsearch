/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import InfiniteHits from './InfiniteHits';

describe('Hits', () => {
  it('accepts a itemComponent prop', () => {
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const Hit = 'Hit';
    const tree = renderer.create(
      <InfiniteHits
        itemComponent={Hit}
        hits={hits}
        hasMore={false}
        refine={() => undefined}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});

