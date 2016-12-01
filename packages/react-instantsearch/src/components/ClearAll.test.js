/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import ClearAll from './ClearAll';

describe('ClearAll', () => {
  it('renders a clickable button', () =>
    expect(
      renderer.create(
        <ClearAll
          refine={() => null}
          items={[{filter: 1}]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );

  it('has a disabled mode', () =>
    expect(
      renderer.create(
        <ClearAll
          refine={() => null}
          items={[]}
        />
      ).toJSON()
    ).toMatchSnapshot()
  );
});
