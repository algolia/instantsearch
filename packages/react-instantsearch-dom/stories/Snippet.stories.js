import PropTypes from 'prop-types';
import React from 'react';
import { Snippet, Hits } from '../packages/react-instantsearch/dom';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';

const stories = storiesOf('Snippet', module);

const Default = ({ hit }) => (
  <article>
    <p>
      <Snippet attribute="name" hit={hit} />
    </p>
    <p>
      <Snippet attribute="description" hit={hit} />
    </p>
  </article>
);

Default.propTypes = {
  hit: PropTypes.object.isRequired,
};

const StrongHits = ({ hit }) => (
  <article>
    <p>
      <Snippet
        attribute="name"
        tagName={text('tag name (title)', 'strong')}
        hit={hit}
      />
    </p>
    <p>
      <Snippet
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
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Snippet">
      <Hits hitComponent={Default} />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="Snippet">
      <Hits hitComponent={StrongHits} />
    </WrapWithHits>
  ));
