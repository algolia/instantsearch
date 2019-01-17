/* eslint-disable no-console */

import * as rollup from 'rollup';
import watch from 'watch';
import { join } from 'path';

export default callback => {
  watch.watchTree(
    join(__dirname, '..', 'functional-tests'),
    (f, curr, prev) => {
      // Finished walking the tree
      if (typeof f === 'object' && prev === null && curr === null) {
        return;
      }

      // As the ignoreDirectoryPattern option is not working
      if (f.match(/functional-tests\/screenshots/) !== null) {
        return;
      }

      console.log('Got test file change');
      callback();
    }
  );

  const rollupWatcher = rollup.watch();

  rollupWatcher.on('START', () => {
    callback();
  });

  rollupWatcher.on('ERROR', error => {
    console.error(error);
    throw error;
  });

  rollupWatcher.on('END', () => {
    console.log('Got Rollup compilation event');
    callback();
  });
};
