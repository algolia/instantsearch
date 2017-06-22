// This script is normalising the output of Happo.
// Happo is hashing the folders and the filenames of the screenshots.
// We are reversing the process with the data available in `screenshots/resultSummary.json`.

import path from 'path';
import fs from 'fs-extra';
import initializeConfig from 'happo/lib/initializeConfig';
import { config, getLastResultSummary, pathToSnapshot } from 'happo-core';

config.set(initializeConfig());
const resultSummaryJSON = getLastResultSummary();

Promise.all(
  resultSummaryJSON.newImages.map(newImage => {
    const input = pathToSnapshot({
      ...newImage,
      fileName: 'current.png',
    });
    const [suite, name] = newImage.description.split('-');
    const output = path.join(
      config.get().snapshotsFolder,
      suite,
      `${name}-${newImage.viewportName}.png`
    );

    return new Promise((accept, reject) => {
      fs.move(input, output, err => {
        if (err) {
          reject(err);
          return;
        }
        fs.remove(
          input.replace(`/@${newImage.viewportName}/current.png`, ''),
          err2 => {
            if (err2) {
              reject(err2);
              return;
            }
            accept();
          }
        );
      });
    });
  })
);
