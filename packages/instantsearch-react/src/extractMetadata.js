import webpack from 'webpack';
import fs from 'fs';
import MemoryFS from 'memory-fs';
import path from 'path';
import ExternalsPlugin from 'webpack-externals-plugin';
import requireFromString from 'require-from-string';

import {getDisplayName} from './utils';

const folder = path.resolve(__dirname, 'widgets');
const entries = fs.readdirSync(folder)
  .filter(filename =>
    filename.match(/.js$/) && !filename.match(/\.test\.js$/)
  )
  .reduce((res, filename) => ({
    ...res,
    [filename]: path.resolve(folder, filename),
  }), {});
const compiler = webpack({
  entry: entries,

  output: {
    filename: '[name]',
    path: '/',
    libraryTarget: 'commonjs2',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: __dirname,
        loaders: [
          'babel',
          path.resolve(__dirname, 'inlinePropsLoader.js'),
        ],
      },
    ],
  },

  plugins: [
    new ExternalsPlugin({
      type: 'commonjs',
      test: /node_modules/,
    }),
    new webpack.DefinePlugin({
      __DOC__: JSON.stringify(true),
    }),
  ],
});

const mfs = new MemoryFS();
compiler.outputFileSystem = mfs;

compiler.run(err => {
  if (err) {
    throw err;
  }

  const output = Object.keys(entries).reduce((res, entry) => {
    const str = mfs.readFileSync(path.resolve('/', entry), 'utf8');
    const Component = requireFromString(str).default;
    return {
      ...res,
      [entry]: {
        displayName: getDisplayName(Component),
        props: Component.propTypes,
      },
    };
  }, {});

  console.log(JSON.stringify(output, null, '  '));
});
