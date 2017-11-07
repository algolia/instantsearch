import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { PoweredBy } from '../packages/react-instantsearch/dom';
import { displayName, filterProps, WrapWithHits } from './util';
import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('PoweredBy', module);

stories.addWithJSX(
  'default',
  () => (
    <WrapWithHits linkedStoryGroup="PoweredBy">
      <PoweredBy />
    </WrapWithHits>
  ),
  {
    displayName,
    filterProps,
  }
);
