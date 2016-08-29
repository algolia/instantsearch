import marked from 'marked';
import unescape from 'unescape-html';

import highlight from './highlight';

const renderer = new marked.Renderer();
renderer.code = (code, lang) => highlight(code, lang);
renderer.codespan = code => highlight(unescape(code), 'js', true);

export default renderer;
