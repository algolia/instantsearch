import {glob} from 'glob';
import {stat} from 'fs';
import async from 'async';

export default function sourcesPlugin(sources, {ignore, computeFilename}) {
  return (files, m, pluginDone) =>
    async.reduce(
      sources,
      {},
      (sourcesMemo, source, globDone) => {
        glob(
          source,
          {ignore},
          (globErr, filenames) => {
            if (globErr) {
              globDone(globErr);
              return;
            }

            async.reduce(
              filenames,
              {},
              (statMemo, filename, statDone) => {
                stat(filename, (statErr, stats) => {
                  if (statErr) {
                    pluginDone(statErr);
                    return;
                  }

                  statDone(null, {...statMemo, [computeFilename(filename)]: {stats}});
                });
              },
              (err, filesnamesWithStat) => {
                if (err) {
                  globDone(err);
                  return;
                }

                globDone(null, {
                  ...sourcesMemo,
                  ...filesnamesWithStat,
                });
              }
            );
          }
        );
      },
      (err, newFiles) => {
        if (err) {
          pluginDone(err);
          return;
        }

        Object.assign(files, newFiles);
        pluginDone(null);
      }
    );
}
