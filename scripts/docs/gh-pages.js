import ghpages from 'gh-pages';
import {join} from 'path';

let basePath = join(__dirname, '../../docs/_site');

ghpages.clean();

let config = {
  logger: msg => console.log(msg),
  only: '!(react/)'
};

if (process.env.CI === 'true') {
  ghpages.publish(basePath, {
    ...config,
    repo: 'https://' + process.env.GH_TOKEN + '@github.com/algolia/instantsearch.js.git'
  }, end);
} else {
  ghpages.publish(basePath, config, end);
}

function end(err) {
  if (err) {
    throw err;
  } else {
    console.log('published gh-pages');
  }
}
