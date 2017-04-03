import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Highlight, Hits} from '../packages/react-instantsearch/dom';
import {withKnobs, text} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Highlight', module);

stories.addDecorator(withKnobs);

const Default = ({hit}) =>
  <p>
    <Highlight attributeName="name" hit={hit}/>
  </p>;

Default.propTypes = {
  hit: React.PropTypes.object.isRequired,
};

const StrongHits = ({hit}) =>
  <p>
    <Highlight attributeName="name" TagName={text('tag name', 'strong')} hit={hit}/>
  </p>;

StrongHits.propTypes = {
  hit: React.PropTypes.object.isRequired,
};

stories.add('default', () =>
  <WrapWithHits hasPlayground={false} linkedStoryGroup="Highlight" >
    <Hits hitComponent={Default} />
  </WrapWithHits>
).add('custom tag', () =>
  <WrapWithHits hasPlayground={true} linkedStoryGroup="Highlight" >
    <Hits hitComponent={StrongHits} />
  </WrapWithHits>
);
