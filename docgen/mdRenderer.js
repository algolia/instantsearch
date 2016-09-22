import marked from 'marked';
import unescape from 'unescape-html';

import highlight from './syntaxHighlighting.js';

const renderer = new marked.Renderer();
renderer.heading = (text, level, raw) => {
  const id = raw.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${level} id="${id}" class="heading">${text}<a class="anchor" href="#${id}"></a></h${level}>`;
};
renderer.code = (code, lang) => highlight(code, lang);
renderer.codespan = code => highlight(unescape(code), 'js', true);

export default renderer;
