'use strict';
var jsdoc = require('jsdoc-to-markdown');

/**
 * Same as lodash keyBy, turns an array of objects into an object keyed by the
 * value of the given key. When there are multiple objects with the same key,
 * the last one wins.
 */
function keyBy(arr, key) {
  return arr.reduce(function (obj, o) {
    obj[o[key]] = o;
    return obj;
  }, {});
}

module.exports = function (opts) {
  if (!opts.src) throw new Error('opts.src must be defined');
  var namespace = opts.namespace;

  return function (_files, metalsmith) {
    var files = metalsmith.path(opts.src);
    return jsdoc.getTemplateData({ files: files }).then((data) => {
      var filteredData = data.filter(function (o) {
        return !o.deprecated;
      });
      var metadata = metalsmith.metadata();
      if (!namespace) metadata.jsdoc = keyBy(filteredData, 'longname');
      else {
        metadata.jsdoc = metadata.jsdoc || {};
        metadata.jsdoc[namespace] = keyBy(filteredData, 'name');
        // console.log(JSON.stringify(metadata.jsdoc, null, 2));
      }
    });
  };
};
