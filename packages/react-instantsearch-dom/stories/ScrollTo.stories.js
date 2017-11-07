import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { ScrollTo, Hits, Configure } from '../packages/react-instantsearch/dom';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('ScrollTo', module);

stories.addWithJSX(
  'default',
  () => (
    <WrapWithHits linkedStoryGroup="ScrollTo">
      <Configure hitsPerPage={5} />
      <ScrollTo>
        <Hits />
      </ScrollTo>
    </WrapWithHits>
  ),
  {
    displayName,
    filterProps,
  }
);
