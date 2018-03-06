import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import Hits from './Hits';

describe('Hits', () => {
  const Hit = ({ hit }) => <div id={hit.objectID} />;

  Hit.propTypes = {
    hit: PropTypes.object,
  };

  it('accepts a hitComponent prop', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];

    const tree = renderer.create(<Hits hitComponent={Hit} hits={hits} />);

    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('accepts a custom className', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];

    const tree = renderer.create(
      <Hits className="MyCustomHits" hitComponent={Hit} hits={hits} />
    );

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
