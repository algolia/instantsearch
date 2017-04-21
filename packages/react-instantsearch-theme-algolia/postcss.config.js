/* eslint-disable import/no-commonjs */
// This cannot use ES6 exports, it will be read by something that only
// reads commonjs exports
module.exports = {
  plugins: [require('autoprefixer')],
};
