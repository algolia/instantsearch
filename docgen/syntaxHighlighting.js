import {runMode} from 'codemirror/addon/runmode/runmode.node';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import escape from 'escape-html';

export default function highlight(source, lang = 'js', inline = false) {
  let theme = "mdn-like";
  if (lang == "java") {
    lang = "text/x-java";
    theme = "eclipse";
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
