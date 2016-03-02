import debounce from 'lodash/function/debounce';
import watch from './dev-functional-tests-compile-watch.js';

import {spawn} from 'child_process';

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

watch(launch);
