import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {MultiRange, Panel} from '../packages/react-instantsearch/dom';
import {withKnobs} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('MultiRange', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits linkedStoryGroup="MultiRange">
    <MultiRange attributeName="price"
      items={[
        {end: 10, label: '<$10'},
        {start: 10, end: 100, label: '$10-$100'},
        {start: 100, end: 500, label: '$100-$500'},
        {start: 500, label: '>$500'},
      ]}
    />
  </WrapWithHits>
).add('with a default range selected', () =>
  <WrapWithHits >
    <MultiRange attributeName="price"
                items={[
                  {end: 10, label: '<$10'},
                  {start: 10, end: 100, label: '$10-$100'},
                  {start: 100, end: 500, label: '$100-$500'},
                  {start: 500, label: '>$500'},
                ]}
                defaultRefinement=":10"
    />
  </WrapWithHits>
).add('with panel', () =>
  <WrapWithHits>
      <Panel title="Price">
        <MultiRange attributeName="price"
          items={[
            {end: 10, label: '<$10'},
            {start: 10, end: 100, label: '$10-$100'},
            {start: 100, end: 500, label: '$100-$500'},
            {start: 500, label: '>$500'},
          ]}
        />
      </Panel>
  </WrapWithHits>
).add('with panel but no refinement', () =>
  <WrapWithHits searchBox={false}>
      <Panel title="Price">
        <MultiRange attributeName="price"
          items={[]}
        />
      </Panel>
  </WrapWithHits>
);
