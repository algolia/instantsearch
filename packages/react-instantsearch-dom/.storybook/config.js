import {configure, setAddon} from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';
import {setOptions} from '@kadira/storybook-addon-options';

setOptions({
  name: 'REACT-INSTANTSEARCH',
  url: 'https://community.algolia.com/instantsearch.js/react/',
  goFullScreen: false,
  showLeftPanel: true,
  showDownPanel: true,
  showSearchBox: false,
  downPanelInRight: true,
});

setAddon(infoAddon);

const req = require.context('../stories', true, /.stories.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
