/* global Clipboard */
'use strict';

(function($) {
  function q(select) { return Array.prototype.slice.call(document.querySelectorAll(select), 0);}

  function search() {
    function t(tmpl, vars) {
      Object.keys(vars).forEach(function(k) {
        tmpl = tmpl.replace(new RegExp('\\$' + k, 'g'), vars[k]);
      });
      return tmpl;
    }
    var constants = {
      appId: 'latency',
      apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
      indexName: 'instant_search'
    };
    var codeSnippets = q('.code-sample-snippet:not(.start):not(.config):not(.ignore)');
    var configSnippet = q('.code-sample-snippet.config')[0];
    var startSnippet = q('.code-sample-snippet.start')[0];

    var source = codeSnippets.map(function(snippet) {
      var functionBody = [configSnippet, snippet, startSnippet]
          .map(function(e) { return e.textContent; })
          .join(';');
      return '(function() {' + functionBody + '})();';
    });

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
    $(document).on('click', '.toggle-doc-button.jsdoc-btn', function() {
      var $btn = $(this);
      var $box = $btn.closest('.code-box');
      $box.find('.toggle-doc-button').removeClass('active');
      $btn.addClass('active');
      $box.find('.code-sample-snippet, .html-container').hide();
      $('.debug-widget').removeClass('debug-widget');
      $box.find('.jsdoc').show();
    });
    $(document).on('click', '.toggle-doc-button.snippet-btn', function() {
      var $btn = $(this);
      var $box = $btn.closest('.code-box');
      $box.find('.toggle-doc-button').removeClass('active');
      $btn.addClass('active');
      $box.find('.jsdoc, .html-container').hide();
      $('.debug-widget').removeClass('debug-widget');
      $box.find('.code-sample-snippet').show();
    });
  }

  function cleanupAndHighlightMarkup(source) {
    var lines = source
      .replace(/ data-reactid="[^"]+"/g, '') // cleanup react-id
      .replace(/ class=""/g, '') // cleanup empty classes
      .replace(/(<|>|\n)/g, '\n$1').replace(/\n>/g, '>') // 1 tag per line
      .replace(/\s*\n+\s*\n+\s*/g, '\n').replace(/^\n+/g, '') // normalize number of spaces
      .replace(/<div>\n<\/div>\n/g, '') // remove empty divs
      .replace(/>([^<>]+)\n/g, '>\n$1\n').replace(/\n([^<>]+)</g, '\n$1\n<') // restore non-nested content
      .replace(/\n+/g, '\n') // normalize extra newlines
      .split('\n');
    var indent = 0;
    source = '';
    lines.forEach(function(line) {
      if (line.indexOf('</') === 0) {
        --indent;
      }
      for (var i = 0; i < indent; ++i) {
        source += '  ';
      }
      source += line + '\n';
      if (line.indexOf('<') === 0 && line.indexOf('</') !== 0 && line.indexOf('<input') === -1) {
        ++indent;
      }
    });
    return source;
  }

  function htmlTabs() {
    $('.widget-container').each(function() {
      var id = $(this).attr('id');
      var buttons = $('.code-box pre:contains("#' + id + '")').closest('.code-box').find('.btn-group');
      buttons.append('<button type="button" class="toggle-doc-button html-btn btn btn-default btn-sm" data-widget-container="' + id + '">View HTML</button>');
      buttons.after('<pre class="html-container highlight" id="html-' + id + '" style="display: none"></pre>');
    });
    $(document).on('click', '.toggle-doc-button.html-btn', function() {
      var $btn = $(this);
      var $box = $btn.closest('.code-box');
      var id = $(this).data('widget-container');
      var $widget = $('#' + id);
      var source = cleanupAndHighlightMarkup($widget.html());
      var htmlSource = $('<div />').text(source).html();
      $('#html-' + id).html(htmlSource
        .replace(/ ([a-z]+=)"([^"]+)"/g, ' <span class="na">$1</span><span class="s">"$2"</span>') // highlight classes
        .replace(/(&lt;\/?[a-z]+(&gt;)?)/g, '<span class="nt">$1</span>') // highlight tags
        .replace(/(&gt;)\n/g, '<span class="nt">&gt;</span>\n') // highlight closing chevron
      );
      $box.find('.toggle-doc-button').removeClass('active');
      $btn.addClass('active');
      $box.find('.code-sample-snippet, .jsdoc').hide();
      $('.debug-widget').removeClass('debug-widget');
      $widget.addClass('debug-widget');
      $box.find('.html-container').show();
    });
  }

  function anchorableTitles() {
    $('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').each(function() {
      var h = $(this);
      h.append(' <a href="#' + h.attr('id') + '" class="anchor"><i class="fa fa-link"></i></a>');
    });
  }

  function copyButtons() {
    $('.code-box').each(function() {
      var $snippet = $(this).find('.code-sample-snippet');
      $snippet.prepend(
        '<button type="button" class="btn btn-default btn-xs copy-btn"><i class="fa fa-clipboard"></i> Copy</button>'
      );
    });
    new Clipboard('.copy-btn', {
      text: function(trigger) {
        return $(trigger).closest('.code-sample-snippet').find('pre').text();
      }
    });
  }

  function tocMenu(){
    $('.toc-menu select').change(function(){
      var href = $(this).val();
      window.location.hash = href;
      $('html, body').animate({scrollTop: '-=100px'}, 800);
    });
  }

  search();
  codeTabs();
  htmlTabs();
  anchorableTitles();
  copyButtons();
  tocMenu();
})(window.jQuery);
