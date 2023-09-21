import { configure } from '@storybook/vue';
import { setOptions } from '@storybook/addon-options';

setOptions({
  name: 'vue-instantsearch',
  url: 'https://github.com/algolia/instantsearch',
  goFullScreen: false,
  showStoriesPanel: true,
  showAddonPanel: true,
  showSearchBox: false,
  addonPanelInRight: true,
  sidebarAnimations: false,
});

import 'instantsearch.css/themes/algolia-min.css';
import './styles.css';

import Vue from 'vue';
import InstantSearch from '../src/instantsearch';

Vue.config.productionTip = false;
Vue.use(InstantSearch);

const req = require.context('../stories', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
