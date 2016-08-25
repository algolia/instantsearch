import marked from 'marked';
import {runMode} from 'codemirror/addon/runmode/runmode.node';
import 'codemirror/mode/jsx/jsx';
import escape from 'escape-html';

const highlight = source => {
  let output = '';
  // Even though highlight accepts a lang parameter, force to JSX for now.
  runMode(source, 'jsx', (text, style) => {
    text = escape(text);
    if (!style) {
      output += text;
      return;
    }
    const className = style.split(' ').map(s => `cm-${s}`).join(' ');
    output += `<span class="${className}">${text}</span>`;
  });
  return output;
};

const blockTheme = 'cm-s-default';
const spanTheme = 'cm-s-default';
const renderer = new marked.Renderer();
renderer.code = (code, lang) => {
  return `<pre class="CodeMirror ${blockTheme}"><code>${highlight(code, lang)}</code></pre>`;
};
renderer.codespan = code => {
  return `<code class="CodeMirror ${spanTheme}">${code}</code>`;
};

export default renderer;
