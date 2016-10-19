import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Pagination} from '../packages/react-instantsearch';
import {withKnobs, boolean, number} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('Pagination', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits >
    <Pagination/>
  </WrapWithHits>
)
  .add('with all props', () =>
    <WrapWithHits >
    <Pagination
        showFirst={true}
        showLast={true}
        showPrevious={true}
        showNext={true}
        pagesPadding={2}
        maxPages={3}
      />
    </WrapWithHits>
  ).add('playground', () =>
  <WrapWithHits >
  <Pagination
      showFirst={boolean('show First', true)}
      showLast={boolean('show Last', true)}
      showPrevious={boolean('show Previous', true)}
      showNext={boolean('show Next', true)}
      pagesPadding={number('pages Padding', 2)}
      maxPages={number('max Pages', 3)}
    />
  </WrapWithHits>
);
