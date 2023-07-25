import React from 'react';
import renderer from 'react-test-renderer';

import PoweredBy from '../PoweredBy';

describe('PoweredBy', () => {
  it('default', () => {
    const tree = renderer
      .create(<PoweredBy createURL={() => '#'} url="url" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('default with className', () => {
    const tree = renderer
      .create(
        <PoweredBy
          className="MyCustomPoweredBy"
          createURL={() => '#'}
          url="url"
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('applies translations', () => {
    const tree = renderer
      .create(
        <PoweredBy
          createURL={() => '#'}
          url="url"
          translations={{
            searchBy: ' Search By',
          }}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
