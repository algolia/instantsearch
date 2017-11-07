import { runMode } from 'codemirror/addon/runmode/runmode.node';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import escape from 'escape-html';

export default function highlight(source, lang) {
  let tokenizedSource = '';

  if (lang === 'html') {
    lang = 'htmlmixed';
  }
  if (lang === 'js') {
    lang = 'jsx';
  }
  if (lang === 'shell') {
    lang = 'shell';
  }
  // eslint-disable-next-line no-unused-var
  const codeType = lang === 'shell' ? 'Command' : 'Code';

  // this is a synchronous callback API
  runMode(source, lang, (text, style) => {
    text = escape(text);

    if (!style) {
      tokenizedSource += text;
      return;
    }

    tokenizedSource += `<span class="cm-${style.replace(/ +/g, ' cm-')}">${
      text
    }</span>`;
  });

  return `<pre class="code-sample cm-s-mdn-like codeMirror ${
    lang
  }" data-code-type="${codeType}"><div class="code-wrap"><code>${
    tokenizedSource
  }</code></div></pre>`;
}
