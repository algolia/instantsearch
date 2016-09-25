const path = require('path');
const {join} = require('path');

module.exports = {
  module: {
    loaders: [
      {
        test: /\.css?$/,
        loaders: [ 'style-loader', 'css-loader?modules&importLoaders=1&localIdentName=ais-[name]__[local]' ],
        include: path.resolve(__dirname, '../')
      }
    ]
  },
}