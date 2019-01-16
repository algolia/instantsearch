const path = require('path');
const ghpages = require('gh-pages');

const websiteDir = path.join(
  __dirname,
  '../docgen/docs-production/react-instantsearch'
);

ghpages.clean();

ghpages.publish(
  websiteDir,
  {
    silent: true,
    add: true,
    logger(input) {
      console.log(input);
    },
  },
  err => {
    if (err) {
      throw err;
    }

    console.log('Website published');
  }
);
