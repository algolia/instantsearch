import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import PropTypes from 'prop-types';
import React from 'react';
import { Highlight, Hits } from 'react-instantsearch-dom';

import { WrapWithHits } from './util';

const stories = storiesOf('Highlight', module);

const Default = ({ hit }) => (
  <article>
    <p>
      <Highlight attribute="name" hit={hit} />
    </p>
    <p>
      <Highlight attribute="description" hit={hit} />
    </p>
  </article>
);

Default.propTypes = {
  hit: PropTypes.object.isRequired,
};

const StrongHits = ({ hit }) => (
  <article>
    <p>
      <Highlight
        attribute="name"
        tagName={text('tag name (title)', 'strong')}
        hit={hit}
      />
    </p>
    <p>
      <Highlight
        attribute="description"
        tagName={text('tag name (description)', 'strong')}
        hit={hit}
      />
    </p>
  </article>
);

StrongHits.propTypes = {
  hit: PropTypes.object.isRequired,
};

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Highlight.stories.js">
      <Hits hitComponent={Default} />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="Highlight.stories.js">
      <Hits hitComponent={StrongHits} />
    </WrapWithHits>
  ));
