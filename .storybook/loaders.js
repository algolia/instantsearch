import idObj from 'identity-obj-proxy';

var fileExts = ['jpg', 'png', 'gif', 'eot', 'svg', 'ttf', 'woff', 'woff2'];
var moduleExts = ['css', 'scss', 'sass'];

var loaders = {};

fileExts.forEach(function (ext) {
  loaders[ext] = function (filename) {
    return filename;
  };
});

moduleExts.forEach(function (ext) {
  loaders[ext] = function () {
    return idObj;
  };
});

module.exports = loaders;