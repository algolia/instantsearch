/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import Hits from './Hits';

describe('Hits', () => {
  it('accepts a hitComponent prop', () => {
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const Hit = 'Hit';
    const tree = renderer.create(
      <Hits
        hitComponent={Hit}
        hits={hits}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
