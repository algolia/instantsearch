/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import HitsPerPage from './HitsPerPage';

describe('HitsPerPage', () => {
  it('renders', () =>
    expect(
      renderer.create(
        <HitsPerPage
          refine={() => null}
          currentRefinement={5}
          items={[{
            value: 5,
            label: 'show 5 hits',
          }, {
            value: 10,
            label: 'show 10 hits',
          }]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );
});
