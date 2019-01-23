module.exports = {
  pluginOptions: {
    ssr: {
      nodeExternalsWhitelist: [
        /\.css$/,
        /\?vue&type=style/,
        /vue-instantsearch/,
        /instantsearch.js/,
      ],
    },
  },
  // TODO: remove this when import is from "vue-instantsearch" package
  lintOnSave: false,
};
