import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import JSXAddon from 'storybook-addon-jsx';
import { PoweredBy } from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

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
