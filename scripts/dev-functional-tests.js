import webpack from 'webpack';
import config from './webpack.config.jsdelivr.babel.js';
import debounce from 'lodash/function/debounce';
import watch from 'watch';
import {join} from 'path';

import {spawn} from 'child_process';

const compiler = webpack(config);
let wdio;
const launch = debounce(() => {
  if (wdio) {
    console.log('Restarting tests');
    wdio.kill('SIGINT');
    wdio.kill('SIGINT'); // we need two of them, that's the way wdio works for killing process
  }
  wdio = spawn('wdio', ['functional-tests/wdio.conf.js'], {stdio: [null, process.stdout, null]});
}, 1500, {
  leading: true,
  trailing: true
});

// watch webpack
compiler.watch({
  aggregateTimeout: 300,
  usePolling: true
}, compilationDone);

// watch test files
// first call triggers a watch, but we already have webpack watch triggering
// so we ignore first call
watch.watchTree(join(__dirname, '..', 'functional-tests'), (f, curr, prev) => {
  if (typeof f === 'object' && prev === null && curr === null) {
    return;
  }

  console.log('Got test file change');
  launch();
});

function compilationDone(err) {
  if (err) {
    throw err;
  }

  console.log('Got webpack compilation event');
  launch();
}
