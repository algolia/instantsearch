import {configure, setAddon} from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';

setAddon(infoAddon);

const req = require.context('../stories', true, /.stories.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

// until snapshoting works with above conf, we need to
// manually declare stories
/* function loadStories() {
  require('../stories/SearchBox.stories.js');
  require('../stories/Pagination.stories.js');
  require('../stories/RangeRatings.stories.js');
  require('../stories/Range.stories.js');
}*/
configure(loadStories, module);
