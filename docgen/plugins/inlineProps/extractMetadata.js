import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import ExternalsPlugin from 'webpack-externals-plugin';
import requireFromStringRaw from 'require-from-string';
import {join} from 'path';
import {reduce as asyncReduce} from 'async';
import memoize from 'memoizee';
const mfs = new MemoryFS();
const getCompiler = memoize(entriesArray => {
  const entriesMap = entriesArray.reduce((res, e) => ({...res, [e]: e}), {});

  const compiler = webpack({
    entry: entriesMap,
    cache: true,
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
        {
          test: /\.css$/,
          loader: 'empty-loader',
        },
      ],
    },

    plugins: [
      new ExternalsPlugin({
        type: 'commonjs',
        test: /node_modules/,
      }),
      new webpack.DefinePlugin({
        __DOC__: JSON.stringify('yes'),
      }),
    ],
  });

  compiler.outputFileSystem = mfs;
  return compiler;
});

const requireFromString = memoize(requireFromStringRaw);

export default function extractMetadata(entriesArray, callback) {
  getCompiler(entriesArray).run((err, stats) => {
    if (err) {
      callback(
        new Error(
          `Error while generating props documentation,
          webpack error was ${err}`
        )
      );
      return;
    }

    if (stats.compilation.errors.length > 0) {
      callback(
        new Error(
          `Error while generating props documentation,
          webpack error was ${stats.compilation.errors[0]}`
        )
      );
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
