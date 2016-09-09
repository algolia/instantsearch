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
          if (!file.stats) {
            done(null);
            return;
          }

          if (Date.parse(file.stats.ctime) <= lastRunTime) {
            // file has no layout and was not updated, remove file
            // from files to process
            delete files[name];
          }
          done(null);
          return;
        }

        // file has a layout
        const layoutPath = join(__dirname, `../layouts/${file.layout}`);
        stat(layoutPath, (err, layoutStats) => {
          if (err) {
            done(err);
            return;
          }

          if (
            layoutStats.ctime > lastRunTime || // layout was updated, keep the corresponding file
            Date.parse(file.stats.ctime) > lastRunTime // layout not updated, but file was, keep file
          ) {
            done(null);
            return;
          }

          // nothing changed, remove file from files to process
          delete files[name];
          done(null);
        });
      }),
      err => {
        lastRunTime = Date.now();
        cb(err);
      }
  );
}
