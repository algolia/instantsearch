import {join} from 'path';
import {render} from 'node-sass';
import postcss from 'postcss';
import syntax from 'postcss-scss';
import autoprefixer from 'autoprefixer';
import {writeFile} from 'fs';
import cssnano from 'cssnano';

const handleError = err => {
  if (process.env.NODE_ENV === 'production') {
    throw err;
  }

  // eslint-disable-next-line no-console
  console.error(err);
};

const write = (destination, content) => new Promise((resolve, reject) =>
  writeFile(destination, content, writeErr => {
    if (writeErr) {
      reject(writeErr);
      return;
    }

    resolve();
  })
);

const generateStylesheet = () => {
  const root = join(__dirname, '..');
  const sourceStylesheet = join(root, 'style.scss');
  const builtStylesheet = join(root, 'style.css');
  const minifiedStylesheet = join(root, 'style.min.css');

  const autoprefix = postcss([autoprefixer]);
  const minify = postcss([cssnano]);
  render({
    file: sourceStylesheet,
  }, (sassErr, result) => {
    if (sassErr) {
      handleError(sassErr);
      return;
    }

    autoprefix.process(result.css, {syntax})
      .then(({css: prefixedCss}) =>
        minify
          .process(prefixedCss)
          .then(({css: minifiedCss}) => ({prefixedCss, minifiedCss}))
      )
      .then(({prefixedCss, minifiedCss}) =>
        Promise.all([
          write(builtStylesheet, prefixedCss),
          write(minifiedStylesheet, minifiedCss),
        ])
      )
      .catch(postProcessingErr => { handleError(postProcessingErr); });
  });
};

generateStylesheet();
