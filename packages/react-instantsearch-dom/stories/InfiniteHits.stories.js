import React from 'react';
import PropTypes from 'prop-types';
import { setAddon, storiesOf } from '@storybook/react';
import {
  InfiniteHits,
  Highlight,
  Panel,
  Snippet,
} from '../packages/react-instantsearch/dom';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('InfiniteHits', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits linkedStoryGroup="InfiniteHits" pagination={false}>
        <InfiniteHits />
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .add('with custom rendering', () => (
    <WrapWithHits linkedStoryGroup="InfiniteHits">
      <InfiniteHits hitComponent={Product} />
    </WrapWithHits>
  ))
  .addWithJSX(
    'with Panel',
    () => (
      <WrapWithHits linkedStoryGroup="InfiniteHits" pagination={false}>
        <Panel header="Infinite hits" footer="Footer">
          <InfiniteHits />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );

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
