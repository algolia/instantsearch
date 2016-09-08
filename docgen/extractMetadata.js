import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import ExternalsPlugin from 'webpack-externals-plugin';
import requireFromString from 'require-from-string';
import {join} from 'path';
import {reduce as asyncReduce} from 'async';

export default function extractMetadata(entriesArray, callback) {
  const entriesMap = entriesArray.reduce((res, e) => ({...res, [e]: e}), {});

  const compiler = webpack({
    entry: entriesMap,

    output: {
      filename: '[name]',
      path: '/',
      libraryTarget: 'commonjs2',
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: [
            'babel',
            join(__dirname, 'transformPropsLoader.js'),
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

  compiler.run((err, stats) => {
    if (err) {
      callback(err);
      return;
    }

    if (stats.compilation.errors.length > 0) {
      callback(stats.compilation.errors[0]);
      return;
    }

    asyncReduce(
      entriesArray,
      {},
      (res, e, cb) => {
        const str = mfs.readFileSync(e, 'utf8');
        const Component = requireFromString(str, e);
        cb(null, {
          ...res,
          [e]: Component,
        });
      },
      callback
    );
  });
}
