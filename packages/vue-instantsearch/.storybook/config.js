import { configure } from '@storybook/vue';

import './styles.css';

import Vue from 'vue';
import InstantSearch, {
  createStoreFromAlgoliaCredentials,
} from '../src/instantsearch';

Vue.use(InstantSearch);

const req = require.context('../stories', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
