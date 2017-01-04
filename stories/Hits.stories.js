import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Hits, Highlight, Snippet} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Hits', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="Hits">
    <Hits />
  </WrapWithHits>
);

stories.add('with custom rendering', () =>
  <WrapWithHits>
    <Hits hitComponent={Product}/>
  </WrapWithHits>
);

function Product({hit}) {
  return <div>
    <Highlight attributeName="name" hit={hit}/>
    <p><Highlight attributeName="type" hit={hit}/></p>
    <p><Snippet attributeName="description" hit={hit}/></p>
  </div>;
}

Product.propTypes = {
  hit: React.PropTypes.object.isRequired,
};
