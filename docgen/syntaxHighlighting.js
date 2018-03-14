import {runMode} from 'codemirror/addon/runmode/runmode.node';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/diff/diff';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/shell/shell';
import escape from 'escape-html';

export default function highlight(source, lang = 'javascript', inline = false, runnable = true) {
  const inlineClassNames = ['CodeMirror', 'cm-s-mdn-like'];
  const blockClassNames = [...inlineClassNames, 'code-sample'];

  if (runnable) {
    blockClassNames.push('code-sample-runnable');
  }

  if (lang === 'html') {
    lang = 'htmlmixed';
  }

  let output = '';
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
    return `<code class="${inlineClassNames.join(' ')}">${output}</code>`;
  }

  return `<pre class="${blockClassNames.join(' ')}"><code>${output}</code></pre>`;
}
