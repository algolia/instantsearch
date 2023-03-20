// .storybook/manager.js

import { addons } from '@storybook/manager-api';
import {  create } from '@storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'InstantSearch.js',
    brandUrl: 'https://github.com/algolia/instantsearch',
  }),
});
