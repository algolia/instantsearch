import jsdoc2md from 'jsdoc-to-markdown';
import dmd from 'dmd';
import fs from 'fs';
import util from 'util';
import path from 'path';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import collectJson from 'collect-json';

/* paths used by this script */
let p = {
  src: [
    path.join(__dirname, '../../src/widgets/**/*.js'),
    path.join(__dirname, '../../src/lib/InstantSearch.js')
  ],
  output: path.join(__dirname, '../../docs/_includes/widget-jsdoc')
};

// clean
rimraf.sync(p.output);
mkdirp.sync(p.output);

/* we only need to parse the source code once, so cache it */
jsdoc2md({src: p.src, json: true}).pipe(collectJson(dataReady));

function dataReady(data) {
  /* we are gonna document only the functions, basically the widgets and sometime some
  other functions like the instantsearch() one */
  let fns = data.filter(token => token.kind === 'function');

  /* render an output file for each class */
  renderMarkdown(data, fns);
}

function renderMarkdown(data, fns) {
  let template = fs.readFileSync(path.resolve(__dirname, './widgetTemplate.hbs'), 'utf8');

  fns.forEach(fn => {
    let dmdStream = dmd({
      template: util.format(template, fn.name),
      helper: ['./scripts/helpers']
    });

    dmdStream.pipe(fs.createWriteStream(path.join(p.output, `${fn.name}.md`)));
    dmdStream.end(JSON.stringify(data));
  });
}
