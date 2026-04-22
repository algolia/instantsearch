import { setOptions } from '@storybook/addon-options';
import { configure } from '@storybook/vue';
import 'instantsearch.css/themes/algolia-min.css';
import Vue from 'vue';

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

import InstantSearch from '../src/instantsearch';
import './styles.css';

Vue.config.productionTip = false;
Vue.use(InstantSearch);

const req = require.context('../stories', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
