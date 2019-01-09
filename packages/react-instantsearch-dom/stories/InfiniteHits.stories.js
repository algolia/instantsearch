import React from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import {
  InfiniteHits,
  Highlight,
  Panel,
  Snippet,
} from 'react-instantsearch-dom';
import { WrapWithHits } from './util';

const stories = storiesOf('InfiniteHits', module);

stories
  .add('default', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits" pagination={false}>
      <InfiniteHits />
    </WrapWithHits>
  ))
  .add('with custom rendering', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits">
      <InfiniteHits hitComponent={Product} />
    </WrapWithHits>
  ))
  .add('with Panel', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits" pagination={false}>
      <Panel header="Infinite hits" footer="Footer">
        <InfiniteHits />
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
