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
    var initialSearchState = {
      hitsPerPage: 6
    };
    var codeSnippets = q('.code-sample-snippet:not(.start):not(.config):not(.ignore)');
    var configSnippet = "var search = instantsearch({appId: '$appId', apiKey: '$apiKey'," +
      "indexName: '$indexName', searchParameters: " + JSON.stringify(initialSearchState) + "});\n"
    var startSnippet = q('.code-sample-snippet.start')[0];

    var source = codeSnippets.map(function(snippet) {
      var functionBody = [configSnippet, snippet, startSnippet]
          .map(function(e) { return e.textContent ? e.textContent : e; })
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
      var jsdoc = $this.find('.jsdoc');
      var requirements = $this.find('.requirements');
      var hasCode = code.length > 0;
      var hasJsdoc = jsdoc.length > 0;
      var hasRequirements = requirements.length > 0;

      var needButtons = (hasCode && (hasJsdoc || hasRequirements));
      if (!needButtons) {
        return;
      }

      function getButton(label, target) {
        var $button = $('<button type="button" class="btn btn-default btn-sm toggle-doc-button">' + label + '</button>');
        $button.attr('name', target);
        return $button;
      }
      var $btnGroup = $('<div class="btn-group js-doc-toggle"></div>');
      var $snippetButton = getButton('Example', 'snippet');
      if (hasJsdoc) {
        $btnGroup.append(getButton('Usage', 'jsdoc').addClass('active'));
      } else {
        $snippetButton.addClass('active');
      }
      if (hasRequirements) {
        $btnGroup.append(getButton('Requirements', 'requirements'));
      }
      $btnGroup.append($snippetButton);

      $this.prepend($btnGroup);
      setTimeout(function() {
        $btnGroup.find('button:first-child').click();
      }, 1);
    });
    $(document).on('click', '.toggle-doc-button', function() {
      var $this = $(this);
      var $codeBox = $this.closest('.code-box');
      var $btnGroup = $codeBox.find('.btn-group');
      // Set the current one as active
      $btnGroup.find('.toggle-doc-button').removeClass('active');
      $this.addClass('active');
      // Show the specified target
      $codeBox.find('.js-toggle-snippet,.js-toggle-jsdoc,.js-toggle-requirements,.js-toggle-html').hide();
      $codeBox.find('.js-toggle-' + $this.attr('name')).show();
      // Remove HTML debug if any
      $('.debug-widget').removeClass('debug-widget');
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
      var buttons = $('.code-box pre:contains("container: \'#' + id + '\'")').closest('.code-box').find('.btn-group');
      buttons.append('<button type="button" class="toggle-doc-button html-btn btn btn-default btn-sm" name="html" data-widget-container="' + id + '">View HTML</button>');
      buttons.after('<pre class="html-container highlight js-toggle-html" id="html-' + id + '" style="display: none">kjkjkj</pre>');
    });
    $(document).on('click', '.toggle-doc-button.html-btn', function() {
      var $this = $(this);
      var id = $this.data('widget-container');
      var $widget = $('#' + id);
      var source = cleanupAndHighlightMarkup($widget.html());
      var htmlSource = $('<div />').text(source).html();
      $('#html-' + id).html(htmlSource
        .replace(/ ([a-z]+=)"([^"]+)"/g, ' <span class="na">$1</span><span class="s">"$2"</span>') // highlight classes
        .replace(/(&lt;\/?[a-z]+(&gt;)?)/g, '<span class="nt">$1</span>') // highlight tags
        .replace(/(&gt;)\n/g, '<span class="nt">&gt;</span>\n') // highlight closing chevron
      );
      $widget.addClass('debug-widget');
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
      var $body = $('body');
      var href = $(this).val();
      var scroll0 = $body.scrollTop();
      window.location.hash = href;
      var scroll1 = $body.scrollTop();
      var deltaScroll = scroll1 - scroll0;
      $body.scrollTop($body.scrollTop() - (deltaScroll>0?200:0)).animate({scrollTop: (deltaScroll>0?'+':'-')+'=100px'}, 300)
    });
  }

  // given the dynamic height of the page (widgets init), we need to manually
  // re-scroll on the right anchor on load
  function scrollToRightAnchor() {
    $(window).load(function() {
      var anchor = $(window.location.hash)[0];
      if (anchor) {
        anchor.scrollIntoView(true);
      }
    });
  }

  function foldableDetails() {
    $('.attr-name').on('click', function() {
      var $descriptionParagraph = $(this).next('.attr-description')
      var isVisible = $descriptionParagraph.is(':visible');
      $('.attr-description:not(.important)').hide();
      if(!isVisible) $descriptionParagraph.show();
    });
  }

  search();
  codeTabs();
  htmlTabs();
  anchorableTitles();
  copyButtons();
  tocMenu();
  scrollToRightAnchor();
  foldableDetails();
})(window.jQuery);
