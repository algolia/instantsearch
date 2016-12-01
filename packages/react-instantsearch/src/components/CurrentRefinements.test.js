/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import CurrentRefinements from './CurrentRefinements';

describe('CurrentRefinements', () => {
  it('renders a list of current refinements', () =>
    expect(
      renderer.create(
        <CurrentRefinements
          refine={() => null}
          items={[{
            label: 'Genre',
            value: 'clear all genres',
          }]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );

  it('allows clearing unique items of a refinement', () =>
    expect(
      renderer.create(
        <CurrentRefinements
          refine={() => null}
          items={[{
            label: 'Genre',
            value: 'clear all genres',
            items: [{
              label: 'Sci-fi',
              value: 'clear sci-fi',
            }],
          }]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );
});
