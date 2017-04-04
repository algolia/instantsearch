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

  const heading = lang === 'shell' ? 'Command' : 'Code';

  // this is a synchronous callback API
  runMode(source, lang, (text, style) => {
    text = escape(text);

    if (!style) {
      tokenizedSource += text;
      return;
    }

    tokenizedSource += `<span class="cs-${style.replace(/ +/g, ' cs-')}">${text}</span>`;
  });

  return `<pre class="code-sample language-${lang}">
  <div class="heading">${heading}</div>
  <div class="code-wrap">
    <code>${tokenizedSource}</code>
  </div>
</pre>`;
}
