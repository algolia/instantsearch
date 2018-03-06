import React from 'react';
import { setAddon, storiesOf } from '@storybook/react';
import { Panel, Stats } from '../packages/react-instantsearch/dom';
import { displayName, filterProps, WrapWithHits } from './util';

import JSXAddon from 'storybook-addon-jsx';

setAddon(JSXAddon);

const stories = storiesOf('Stats', module);

stories
  .addWithJSX(
    'default',
    () => (
      <WrapWithHits linkedStoryGroup="Stats">
        <div>
          <Stats />
        </div>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  )
  .addWithJSX(
    'with Panel',
    () => (
      <WrapWithHits linkedStoryGroup="Stats">
        <Panel header="Stats" footer="Footer">
          <Stats />
        </Panel>
      </WrapWithHits>
    ),
    {
      displayName,
      filterProps,
    }
  );
