// this plugin adds the webpack entry points to metadata.webpack.assets
// useful in dev mode when not using ms-webpack
export default function webpackEntryMetadata(webpackConfig) {
  return (filenames, metalsmith, cb) => {
    metalsmith.metadata().webpack = {
      assets: Object
        .keys(webpackConfig.entry)
        .reduce((memo, entryName) => ({
          ...memo,
          [`${entryName}.js`]: `${webpackConfig.output.publicPath}${entryName}.js`,
        }), {}),
    };

    cb();
  };
}
