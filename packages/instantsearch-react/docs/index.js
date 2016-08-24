/* eslint-disable no-console */

import metalsmith from 'metalsmith';
import assets from 'metalsmith-assets';
import layouts from 'metalsmith-layouts';
import headings from 'metalsmith-headings';
import navigation from 'metalsmith-navigation';
import markdown from 'metalsmith-markdown';
import watch from 'metalsmith-watch';
import serve from 'metalsmith-serve';
import marked from 'marked';
import {runMode} from 'codemirror/addon/runmode/runmode.node';
import 'codemirror/mode/jsx/jsx';
import escape from 'escape-html';

const highlight = text => {
  let output = '';
  // Even though highlight accepts a lang parameter, force to JSX for now.
  runMode(text, 'jsx', (text, style) => {
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

metalsmith(__dirname)
  .metadata({
    // If env is undefined, it won't get passed to the templates.
    env: process.env.NODE_ENV || '',
  })
  .use(watch({
    livereload: true,
    paths: {
      '${source}/**/*': true,
      'assets/**/*': true,
      'layouts/**/*': true,
    },
  }))
  .use(assets({
    source: './assets',
    destination: './assets',
  }))
  .use(markdown({
    renderer,
  }))
  // After markdown, so that paths point to the correct HTML file
  .use(navigation({
    main: {
      sortBy: 'nav_sort',
      filterProperty: 'nav_groups',
    },
  }, {
    navListProperty: 'navs',
  }))
  // Consider h2 and h3 elements (##, ###) as headers
  .use(headings('h2, h3'))
  .use(layouts('ejs'))
  .use(serve())
  .build(err => {
    if (err) {
      throw err;
    }
  });
