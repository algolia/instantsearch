let lastRunTime = false;

import {parallel} from 'async';
import {join} from 'path';
import {stat} from 'fs';

export default function onlyChanged(files, metalsmith, cb) {
  if (lastRunTime === false) {
    lastRunTime = Date.now();
    cb(null);
    return;
  }

  parallel(
    Object
      .entries(files)
      .map(([name, file]) => done => {
        if (!file.layout) {
          if (Date.parse(file.stats.ctime) <= lastRunTime) {
            // file has no layout and was not updated, remove file
            // from files to process
            delete files[name];
          }
          done(null);
          return;
        }

        // file has a layout
        const layoutPath = join(__dirname, `layouts/${file.layout}`);
        stat(layoutPath, (err, stats) => {
          if (err) {
            done(err);
            return;
          }

          // layout was updated, keep the corresponding file
          if (stats.ctime > lastRunTime) {
            done(null);
            return;
          }

          // layout was not updated, nothing to do to the file, remove file
          // from files to process
          delete files[name];
          done(null);
        });
      }),
      () => {
        lastRunTime = Date.now();
        cb();
      }
  );
}
