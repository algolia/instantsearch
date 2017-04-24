import {runMode} from 'codemirror/addon/runmode/runmode.node';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/javascript/javascript';
import escape from 'escape-html';

export default function highlight(source, lang = 'javascript', inline = false) {
  let theme = "mdn-like";

  if (lang === 'html') {
    lang = 'htmlmixed';
  }

  const blockTheme = 'cm-s-' + theme;
  const spanTheme = 'cm-s-' + theme;

  let output = '';
  // Even though highlight accepts a lang parameter, force to JSX for now.
  runMode(source, lang, (text, style) => {
    text = escape(text);
    if (!style) {
      output += text;
      return;
    }
    const className = style.split(' ').map(s => `cm-${s}`).join(' ');
    output += `<span class="${className}">${text}</span>`;
  });

  if (inline) {
    return `<code class="CodeMirror ${spanTheme}">${output}</code>`;
  }

  return `<pre class="CodeMirror ${blockTheme}"><code>${output}</code></pre>`;
}
