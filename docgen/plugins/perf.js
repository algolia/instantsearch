/* eslint-disable no-console */

export const start = (label = 'performance') => (files, metalsmith, cb) => {
  console.time(label);
  console.log(`${Object.entries(files).length} file(s) to process: ${Object.keys(files)}`);
  cb();
};

export const stop = (label = 'performance') => (files, metalsmith, cb) => {
  console.timeEnd(label);
  cb();
};
