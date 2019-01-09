import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { Hits, Highlight, Panel, Snippet } from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('Hits', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="Hits">
      <Hits />
    </WrapWithHits>
  ))
  .add('with custom rendering', () => (
    <WrapWithHits linkedStoryGroup="Hits">
      <Hits hitComponent={Product} />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="Hits">
      <Panel header="Hits" footer="Footer">
        <Hits />
      </Panel>
    </WrapWithHits>
  ));

function Product({ hit }) {
  return (
    <div>
      <Highlight attribute="name" hit={hit} />
      <p>
        <Highlight attribute="type" hit={hit} />
      </p>
      <p>
        <Snippet attribute="description" hit={hit} />
      </p>
    </div>
  );
}

Product.propTypes = {
  hit: PropTypes.object.isRequired,
};
