'use strict';
var Handlebars = require('handlebars');

module.exports = function (requires) {
  requires.handlebars = Handlebars;

  var arrayRegexp = /^Array\.<(.+?)>$/;
  var mapRegexp = /^Object\.<string, \(?(.+?)\)?>$/;
  var unionRegexp = /([^|()]+)/gi;
  function formatGenerics(type) {
    var matchArray = arrayRegexp.exec(type);
    if (matchArray) return formatGenerics(matchArray[1]) + '[]';
    var matchMap = mapRegexp.exec(type);
    if (matchMap) return '{ string: ' + formatGenerics(matchMap[1]) + ' }';
    var union = [];
    var m = unionRegexp.exec(type);
    while (m) {
      union.push(m[1]);
      m = unionRegexp.exec(type);
    }
    if (union.length > 1)
      return '(' + union.map(formatGenerics).join('|') + ')';
    return type;
  }
  Handlebars.registerHelper('type', function (options) {
    return options.fn(formatGenerics(this));
  });

  Handlebars.registerHelper('event', function (options) {
    return options.fn(this).split(':')[1];
  });

  Handlebars.registerHelper('codepen', function (hash, height) {
    var h = typeof height === 'number' ? height : 790;
    var url =
      '//codepen.io/Algolia/embed/' +
      hash +
      '?height=' +
      h +
      '&amp;theme-id=light&amp;slug-hash=' +
      hash +
      '&amp;default-tab=result&amp;user=Algolia&amp;embed-version=2';
    var codepenContent =
      '<iframe id="cp_embed_' +
      hash +
      '" src="' +
      url +
      '" scrolling="no" frameborder="0" height="' +
      h +
      '" allowtransparency="true" allowfullscreen="true" name="CodePen Embed" title="CodePen Embed" class="cp_embed_iframe " style="width: 100%; overflow: hidden;"></iframe>';
    var downloadLink =
      '<a href="http://codepen.io/Algolia/share/zip/' +
      hash +
      '/">Download this example.</a>';
    return new Handlebars.SafeString(downloadLink + codepenContent);
  });

  Handlebars.registerHelper('cleanParameters', function (parameters) {
    if (!parameters) return '';
    return new Handlebars.SafeString(
      parameters
        .map(function (p, k) {
          if (p.name.indexOf('.') !== -1) return '';
          if (p.optional)
            return `<span class="param param-${k} optional">${p.name}</span>`;
          return `<span class="param param-${k}">${p.name}</span>`;
        })
        .join('')
    );
  });
};
