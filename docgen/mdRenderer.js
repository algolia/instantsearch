import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import highlight from './syntaxHighlighting';

const md = new MarkdownIt('default', {
  highlight: (str, lang) => highlight(str, lang),
  linkify: true,
  typographer: true,
  html: true,
}).use(markdownItAnchor, {
  permalink: true,
  permalinkClass: 'anchor',
  permalinkSymbol: '',
  // generate proper Getting_started.html#install hrefs since we are
  // using the base href trick to handle different base urls (dev, prod)
  permalinkHref: (slug, { env: { path } }) => `${path}#${slug}`,
});

export default md;
