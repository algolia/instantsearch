import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

import highlight from './syntaxHighlighting.js';

const md =
  new MarkdownIt('default', {
    highlight: (str, lang) => highlight(str, lang),
    linkify: true,
    typographer: true,
  })
  .use(markdownItAnchor, {permalink: true, permalinkClass: 'anchor', permalinkSymbol: ''});

export default md;
