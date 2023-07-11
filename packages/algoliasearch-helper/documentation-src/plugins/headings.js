'use strict';

const { JSDOM } = require('jsdom');

module.exports = function ({ selector = 'h2,h3' } = {}) {
  return function (files) {
    return Object.keys(files).forEach(function (file) {
      if (!file.endsWith('.html')) return;
      var data = files[file];
      var contents = data.contents.toString();
      var { window } = new JSDOM(contents);
      data.headings = [];

      window.document.querySelectorAll(selector).forEach(function (element) {
        data.headings.push({
          id: element.id,
          tag: element.tagName.toLowerCase(),
          text: element.textContent,
        });
      });
    });
  };
};
