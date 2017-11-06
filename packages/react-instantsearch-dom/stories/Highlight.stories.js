import PropTypes from 'prop-types';
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Highlight, Hits } from '../packages/react-instantsearch/dom';
import { withKnobs, text } from '@storybook/addon-knobs';
import { WrapWithHits } from './util';
import { checkA11y } from 'storybook-addon-a11y';

const stories = storiesOf('Highlight', module);

stories.addDecorator(withKnobs).addDecorator(checkA11y);

const Default = ({ hit }) => (
  <article>
    <p>
      <Highlight attributeName="name" hit={hit} />
    </p>
    <p>
      <Highlight attributeName="description" hit={hit} />
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
        attributeName="name"
        tagName={text('tag name (title)', 'strong')}
        hit={hit}
      />
    </p>
    <p>
      <Highlight
        attributeName="description"
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
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Highlight">
      <Hits hitComponent={Default} />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="Highlight">
      <Hits hitComponent={StrongHits} />
    </WrapWithHits>
  ));
