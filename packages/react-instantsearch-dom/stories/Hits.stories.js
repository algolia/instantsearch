import PropTypes from 'prop-types';
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Hits, Highlight, Snippet } from '../packages/react-instantsearch/dom';
import { withKnobs } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('Hits', module);

stories.addDecorator(withKnobs);

stories.add('default', () => (
  <WrapWithHits linkedStoryGroup="Hits">
    <Hits />
  </WrapWithHits>
));

stories.add('with custom rendering', () => (
  <WrapWithHits linkedStoryGroup="Hits">
    <Hits hitComponent={Product} />
  </WrapWithHits>
));

function Product({ hit }) {
  return (
    <div>
      <Highlight attributeName="name" hit={hit} />
      <p><Highlight attributeName="type" hit={hit} /></p>
      <p><Snippet attributeName="description" hit={hit} /></p>
    </div>
  );
}

Product.propTypes = {
  hit: PropTypes.object.isRequired,
};
