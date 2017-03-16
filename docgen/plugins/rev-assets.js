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

// 1. compute MD5 for images -> replace in CSS/JS/HTML
// 2. compute MD5 for "assets" -> replace in CSS/JS/HTML
// 3. compute MD5 for CSS -> replace in JS, HTML
// 4. compute MD5 for JS -> replace in HTML
export default function revAssets(): Promise<*> {
  const IMAGES_PATH = path.join(DIST_PATH, 'images');
  const IMAGES_FILES = glob.sync(`${IMAGES_PATH}/**/*.{svg,png,jpeg,jpg,gif}`);
  const computeImages = () => computeHashForFiles(IMAGES_FILES)
    .then(renameFiles)
    .then(result => renameReferences(`${DIST_PATH}/**/*.{js,html,css}`, result));

  const ASSETS_PATH = path.join(DIST_PATH, 'assets');
  const ASSETS_FILES = glob.sync(`${ASSETS_PATH}/**/*.{json,svg,png,jpeg,jpg,gif}`);
  const computeAssets = () => computeHashForFiles(ASSETS_FILES)
    .then(renameFiles)
    .then(result => renameReferences(`${DIST_PATH}/**/*.{js,html,css}`, result));

  const CSS_PATH = path.join(DIST_PATH, 'stylesheets');
  const CSS_FILES = glob.sync(`${CSS_PATH}/**/*.css`);
  const computeCSS = () => computeHashForFiles(CSS_FILES)
      .then(renameFiles)
      .then(result => renameReferences(`${DIST_PATH}/**/*.html`, result));

  const JS_PATH = path.join(DIST_PATH, 'js');
  const JS_FILES = glob.sync(`${JS_PATH}/**/*.js`);
  const computeJS = () => computeHashForFiles(JS_FILES)
    .then(renameFiles)
    .then(result => renameReferences(`${DIST_PATH}/**/*.html`, result));

  return computeImages()
    .then(computeAssets)
    .then(computeCSS)
    .then(computeJS);
}
