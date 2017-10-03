import ghpages from 'gh-pages';
import {join} from 'path';

let basePath = join(__dirname, '../../docs');

ghpages.clean();

let config = {
  silent: true,
  logger: msg => console.log(msg),
  only: ['**/*', '!v1/**/*', '!v1']
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
