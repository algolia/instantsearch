import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Snippet, Hits} from '../packages/react-instantsearch/dom';
import {withKnobs, text} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Snippet', module);

stories.addDecorator(withKnobs);

const Default = ({hit}) =>
  <p>
    <Snippet attributeName="description" hit={hit}/>
  </p>;

Default.propTypes = {
  hit: React.PropTypes.object.isRequired,
};

const StrongHits = ({hit}) =>
  <p>
    <Snippet attributeName="description" TagName={text('tag name', 'strong')} hit={hit}/>
  </p>;

StrongHits.propTypes = {
  hit: React.PropTypes.object.isRequired,
};

stories.add('default', () =>
  <WrapWithHits hasPlayground={false} linkedStoryGroup="Snippet" >
    <Hits hitComponent={Default} />
  </WrapWithHits>
).add('custom tag', () =>
  <WrapWithHits hasPlayground={true} linkedStoryGroup="Snippet" >
    <Hits hitComponent={StrongHits} />
  </WrapWithHits>
);
