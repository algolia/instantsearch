import fs from 'fs';
import path from 'path';
import glob from 'glob';
import hasha from 'hasha';
import replace from 'replace-in-file';

import config from '../config.js';

const DIST_PATH = path.resolve(config.docsDist);

// HELPERS TO ADD REVISION HASH TO FILENAMES
// -----------------------------------------
function computeHashForFiles(files: string[]): Promise<[{ file: string, hash: string }]> {
  const promises = files.map(
    file => hasha
      .fromFile(file, {algorithm: 'md5'})
      .then(hash => ({file, hash}))
  );

  return Promise.all(promises);
}

function renameFiles(files: { file: string, hash: string }[]): { oldPath: string, newPath: string }[] {
  return files.map(({file, hash}) => {
    const ext = path.extname(file);
    const newPath = `${file.replace(ext, `-${hash}`)}${ext}`;

    // rename original with hash file
    fs.renameSync(file, newPath);

    // check for `.[css|js].map` files to rename also
    if ((ext === '.css' || ext === '.js') && fs.existsSync(`${file}.map`)) {
      fs.renameSync(`${file}.map`, `${newPath}.map`);
    }

    return {oldPath: file, newPath};
  });
}

function renameReferences(inFiles: string|string[], files: { oldPath: string, newPath: string }[]) {
  const {from, to} = files.reduce((toRename, {oldPath, newPath}) => ({
    from: [...toRename.from, new RegExp(oldPath.replace(`${DIST_PATH}/`, ''), 'g')],
    to: [...toRename.to, newPath.replace(`${DIST_PATH}/`, '')],
  }), {from: [], to: []});

  return replace({from, to, files: inFiles});
}

export default function revAssets(): Promise<*> {
  // COMPUTE CSS
  // -----------
  const CSS_PATH = path.join(DIST_PATH, 'stylesheets');
  const CSS_FILES = glob.sync(`${CSS_PATH}/**/*.css`);

  const computeCSSFiles = () => computeHashForFiles(CSS_FILES)
      .then(renameFiles)
      .then(result => renameReferences(`${DIST_PATH}/**/*.html`, result));

  // COMPUTE IMAGES
  // --------------
  const IMAGES_PATH = path.join(DIST_PATH, 'images');
  const IMAGES_FILES = glob.sync(`${IMAGES_PATH}/**/*.{svg,png,jpeg,jpg,gif}`);

  const computeImagesFiles = () => computeHashForFiles(IMAGES_FILES)
      .then(renameFiles)
      .then(result => renameReferences(`${DIST_PATH}/**/*.{html,css}`, result));

  return Promise.all([computeCSSFiles, computeImagesFiles]);
}
