// This plugin mutates the `files` map of metalsmith
// at build time to only keep what was updated
// We consider any update in layouts/ to trigger an update on every html file
// Otherwise, if it's an asset or a file with no layout then we compare
// the file's last modification time to the process start time

import {join} from 'path';

import {parallel} from 'async';
import {watch} from 'chokidar';

let lastRunTime = false;
let layoutChange = true;
let cssChange = true;
const layoutFiles = join(__dirname, '../layouts/**/*');
const cssFiles = join(__dirname, '../src/stylesheets/**/*');
const CSSEntryPoints = ['stylesheets/index.css', 'stylesheets/header.css'];

export const hasChanged = file => file.stats && file.stats.ctime && file.stats.mtime ?
  Date.parse(file.stats.ctime) > lastRunTime || Date.parse(file.stats.mtime) > lastRunTime :
  true;

export default function onlyChanged(files, metalsmith, cb) {
  if (lastRunTime === false) {
    watch(layoutFiles, {ignoreInitial: true})
      .on('all', () => { layoutChange = true; })
      .on('error', err => { throw err; });

    watch(cssFiles, {ignoreInitial: true})
      .on('all', () => { cssChange = true; })
      .on('error', err => { throw err; });

    lastRunTime = Date.now();
    layoutChange = false;
    cssChange = false;
    cb(null);
    return;
  }

  parallel(
    Object
      .entries(files)
      .map(([name, file]) => done => {
        if (!file.stats) {
          done(null); // keep file, we do not know
          return;
        }

        if (!file.layout) {
          const cssEntryPointNeedsUpdate = CSSEntryPoints.indexOf(name) !== -1 && cssChange === true;

          if (!hasChanged(file) && !cssEntryPointNeedsUpdate) {
            // file has no layout and was not updated, remove file
            // from files to process
            delete files[name];
          }

          done(null);
          return;
        }

        if (/\.html$/.test(name) && layoutChange === true) {
          done(null); // html page need rebuild, some layout files changed
          return;
        }

        if (!hasChanged(file)) {
          delete files[name]; // file was not updated, layouts were not updated
        }

        done(null);
      }),
      err => {
        if (!err) {
          lastRunTime = Date.now();
          layoutChange = false;
          cssChange = false;
          console.log(`[metalsmith]: onlyChanged | ${Object.keys(files)}`); // eslint-disable-line no-console
        }
        cb(err);
      }
  );
}
