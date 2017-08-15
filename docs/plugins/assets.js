// extracted from https://github.com/treygriffith/metalsmith-assets
// converted to es6 (http://lebab.io/try-it)
// tweaked to add `stats` to the file object

import fs from 'fs';
import path from 'path';
import readdir from 'recursive-readdir';
import mode from 'stat-mode';
import {each} from 'async';

/**
 * Expose `assets`.
 */

export default assets;

/**
 * Default plugin options
 */
const defaults = {
  source: './public',
  destination: '.',
};

/**
 * Metalsmith plugin to include static assets.
 *
 * @param {Object} userOptions (optional)
 *   @property {String} source Path to copy static assets from (relative to working directory). Defaults to './public'
 *   @property {String} destination Path to copy static assets to (relative to destination directory). Defaults to '.'
 * @return {Function} a Metalsmith plugin
 */
function assets(userOptions = {}) {
  const options = {
    ...defaults,
    ...userOptions,
  };

  return (files, metalsmith, cb) => {
    const src = metalsmith.path(options.source);
    const dest = options.destination;

    // copied almost line for line from https://github.com/segmentio/metalsmith/blob/master/lib/index.js
    readdir(src, (readDirError, arr) => {
      if (readDirError) {
        cb(readDirError);
        return;
      }

      each(arr, read, err => cb(err, files));
    });

    function read(file, done) {
      const name = path.join(dest, path.relative(src, file));
      fs.stat(file, (statError, stats) => {
        if (statError) {
          done(statError);
          return;
        }

        fs.readFile(file, (err, buffer) => {
          if (err) {
            done(err);
            return;
          }

          const newFile = {};

          newFile.contents = buffer;
          newFile.stats = stats;

          newFile.mode = mode(stats).toOctal();
          files[name] = newFile;
          done();
        });
      });
    }
  };
}
