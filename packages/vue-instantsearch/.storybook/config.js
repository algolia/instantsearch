import { configure } from '@storybook/vue';

import 'instantsearch.css/themes/algolia-min.css';
import './styles.css';

import Vue from 'vue';
import InstantSearch from '../src/instantsearch';

Vue.use(InstantSearch);

const req = require.context('../stories', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
