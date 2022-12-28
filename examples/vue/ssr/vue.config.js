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
};
