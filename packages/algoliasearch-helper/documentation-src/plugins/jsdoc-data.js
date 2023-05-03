'use strict';
var jsdoc = require('jsdoc-to-markdown');
var keyBy = require('lodash.keyby');

module.exports = function(opts) {
  if (!opts.src) throw new Error('opts.src must be defined');
  var namespace = opts.namespace;

  return function(_files, metalsmith) {
    var files = metalsmith.path(opts.src);
    return jsdoc.getTemplateData({files: files}).then(data => {
      var filteredData = data.filter(function(o) {return !o.deprecated;});
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
