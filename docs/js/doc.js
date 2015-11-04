/* global instantsearch */

(function($) {
  function q(select) { return Array.prototype.slice.call(document.querySelectorAll(select), 0);}

  function search() {
    function t(tmpl, vars) {
      Object.keys(vars).forEach(function(k) {
        tmpl = tmpl.replace('$' + k, vars[k]);
      });
      return tmpl;
    }
    var constants = {
      appId: 'latency',
      apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
      indexName: 'instant_search'
    };
    var codeSnippets = q('.code-sample-snippet:not(.last):not(.ignore)');
    var lastSnippets = q('.code-sample-snippet.last');
    var source = codeSnippets
      .concat(lastSnippets)
      .map(function(d) {return d.textContent;});
    source = t(source.join('\n'), constants);
    eval(source);
  }

  function codeTabs() {
    $('.code-box').each(function() {
      var $this = $(this);
      var code = $this.find('.code-sample-snippet');
      var doc = $this.find('.jsdoc');
      if (code.length > 0 && doc.length > 0) {
        $(this).prepend(
          '<div class="btn-group">' +
            '<button type="button" class="toggle-doc-button snippet-btn btn btn-default btn-sm active">Snippet</button>' +
            '<button type="button" class="toggle-doc-button jsdoc-btn btn btn-default btn-sm">All options</button>' +
          '</div>'
        );
      }
    });
    $(document).on('click', '.toggle-doc-button.jsdoc-btn', function(e) {
      var $btn = $(this).addClass('active');
      var $box = $btn.closest('.code-box'); 
      $box.find('.code-sample-snippet').hide();
      $box.find('.jsdoc').show();
      $box.find('.snippet-btn').removeClass('active');
    });
    $(document).on('click', '.toggle-doc-button.snippet-btn', function(e) {
      var $btn = $(this).addClass('active');
      var $box = $btn.closest('.code-box'); 
      $box.find('.jsdoc').hide();
      $box.find('.code-sample-snippet').show();
      $box.find('.jsdoc-btn').removeClass('active');
    });
  }

  function indentString(source) {
    var lines = source
      .replace(/ data-reactid="[^"]+"/g, '') // cleanup react-id
      .replace(/ class=""/g, '') // cleanup empty classes
      .replace(/(<|>|\n)/g, '\n$1').replace(/\n>/g, '>') // 1 tag per line
      .replace(/\s*\n+\s*\n+\s*/g, '\n').replace(/^\n+/g, '') // normalize number of spaces
      .replace(/<div>\n<\/div>\n/g, '') // remove empty divs
      .replace(/\n(<\/(?:a|span|small)>)/g, '$1') // restore inline tags
      .split('\n');
    var indent = 0;
    source = '';
    lines.forEach(function(line) {
      if (line.indexOf('</div') === 0 || line.indexOf('</label') === 0) {
        --indent;
      }
      for (var i = 0; i < indent; ++i) {
        source += '  ';
      }
      source += line + '\n';
      if (line.indexOf('<div') === 0 || line.indexOf('<label') === 0) {
        ++indent;
      }
    });
    return source;
  }

  function htmlTabs() {
    $('.widget-container').each(function() {
      $(this).before(
        '<div class="toggle-html-button"><button type="button" class="btn btn-default btn-xs">View source <i class="fa fa-caret-down"></i></button></div>'
      );
      $(this).after('<pre class="html-container" style="display: none"></pre>');
    });
    $(document).on('click', '.toggle-html-button button', function(e) {
      e.preventDefault();
      var button = $(e.target);
      var widget = button.parent().next();
      var code = widget.next();
      code.toggle();
      widget.toggle();
      var source = indentString(widget.html());
      code.text(source);
      button.html(code.is(':visible') ? 'Hide source <i class="fa fa-caret-up"></i>' : 'View source <i class="fa fa-caret-down"></i>');
    });
  }

  function anchorableTitles() {
    $('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').each(function() {
      var h = $(this);
      h.append(' <a href="#' + h.attr('id') + '" class="anchor"><i class="fa fa-link"></i></a>');
    });
  }

  search();
  codeTabs();
  // htmlTabs();
  anchorableTitles();
})(window.jQuery);
