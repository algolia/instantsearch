import webpack from 'webpack';
import fs from 'fs';
import MemoryFS from 'memory-fs';
import path from 'path';
import ExternalsPlugin from 'webpack-externals-plugin';
import requireFromString from 'require-from-string';

export default function extractMetadata(entries, callback) {
  const entry = entries.reduce((res, e) => ({...res, [e]: e}), {});

  const compiler = webpack({
    entry,

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
            path.resolve(__dirname, 'transformPropsLoader.js'),
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
      callback(err);
      return;
    }

    const output = entries.reduce((res, e) => {
      const str = mfs.readFileSync(e, 'utf8');
      const Component = requireFromString(str);
      return {
        ...res,
        [e]: Component,
      };
    }, {});

    callback(null, output);
  });
}
