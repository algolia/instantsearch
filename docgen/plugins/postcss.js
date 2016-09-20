import postcss from 'postcss';

import map from 'lodash/map';
import pickBy from 'lodash/pickBy';

export default postCssPlugin;

function postCssPlugin(plugins = []) {
  const postCss = postcss(plugins);
  return function postCssRun(files, metalsmith, cb) {
    const cssFiles = pickBy(files, (f, name) => Boolean(name.match(/.+\.css$/)));
    if (cssFiles.length === 0) cb();

    const src = metalsmith._directory;
    const dest = metalsmith._destination;

    Promise.all(
      map(
        cssFiles,
        (msFile, path) =>
          postCss
          .process(msFile.contents, {
            from: src + path,
            to: dest + path,
          })
          .then(result => {
            files[path].contents = result.css;
            if (result.map) {
              const mapFile = `${path}.map`;
              files[mapFile] = {};
              files[mapFile].contents = result.map;
              files[mapFile].mode = '0644';
            }
          })
    )).then(() => cb());
  };
}
