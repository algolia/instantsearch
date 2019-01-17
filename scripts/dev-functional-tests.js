/* eslint-disable no-console */

import { spawn } from 'child_process';
import debounce from 'lodash/debounce';
import watch from './dev-functional-tests-compile-watch';

const REBUILD_TIMEOUT = 1500;
let wdio;
const launch = debounce(
  () => {
    if (wdio) {
      console.log('Restarting tests');
      wdio.kill('SIGINT');
      wdio.kill('SIGINT'); // we need two of them, that's the way wdio works for killing process
    }
    wdio = spawn('wdio', ['functional-tests/wdio.conf.js'], {
      stdio: [null, process.stdout, null],
    });
  },
  REBUILD_TIMEOUT,
  {
    leading: true,
    trailing: true,
  }
);

watch(launch);
