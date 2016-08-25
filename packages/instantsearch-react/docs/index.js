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
import {resolve} from 'path';

const r = (...args) => resolve(__dirname, ...args);

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

const source = (dir, only, processFiles) => (files, m, callback) =>
  metalsmith(dir)
    .source('.')
    .ignore(`!${only}`)
    .process((err, newFiles) => {
      const processedFiles = Object.entries(newFiles).reduce((res, [name, file]) => {
        const [newName, newFile] = processFiles(name, file);
        return {
          ...res,
          [newName]: newFile,
        };
      }, {});
      // Yep
      Object.assign(files, processedFiles);
      callback(err);
    });

metalsmith(__dirname)
  .use(
    source(r('../src'), r('../src/widgets/**/*.md'), (name, file) =>
      [
        name.replace(/widgets\/(.*)\/README\.md/, '$1.md'),
        {
          ...file,
          path: r('../src', name),
        },
      ]
    )
  )
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
    core: {
      sortBy: 'nav_sort',
      filterProperty: 'nav_groups',
    },
    widgets: {
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
