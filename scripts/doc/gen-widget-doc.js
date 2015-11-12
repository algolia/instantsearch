let jsdoc2md = require('jsdoc-to-markdown');
let dmd = require('dmd');
let fs = require('fs');
let util = require('util');
let path = require('path');
let rimraf = require('rimraf');
let mkdirp = require('mkdirp');

/* paths used by this script */
let p = {
  src: [path.resolve(__dirname, '../../widgets/**/*.js'), path.resolve(__dirname, '../../lib/InstantSearch.js')],
  json: path.resolve(__dirname, '../../source.json'),
  output: path.resolve(__dirname, '../../docs/_includes/widget-jsdoc')
};

// clean
rimraf.sync(p.output);
mkdirp.sync(p.output);

/* we only need to parse the source code once, so cache it */
jsdoc2md({src: p.src, json: true})
  .pipe(fs.createWriteStream(p.json))
  .on('close', dataReady);

function dataReady() {
  /* parse the jsdoc-parse output.. */
  let data = require(p.json);

  /* ..because we want an array of class names */
  let classes = data.reduce(function(prev, curr) {
    if (curr.kind === 'function') prev.push(curr.name);
    return prev;
  }, []);

  /* render an output file for each class */
  renderMarkdown(classes, 0);
}

function renderMarkdown(classes, index) {
  let className = classes[index];

  let templateFile = path.resolve(__dirname, './widgetTemplate.hbs');

  fs.readFile(templateFile, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    console.log(util.format(
      'rendering %s', className
    ));

    let template = util.format(data, className);
    let config = {
      template: template,
      helper: ['./scripts/helpers']
    };

    fs.createReadStream(p.json)
        .pipe(dmd(config))
        .pipe(fs.createWriteStream(util.format(path.join(p.output, '%s.md'), className)))
        .on('close', function() {
          let next = index + 1;
          if (classes[next]) {
            renderMarkdown(classes, next);
          } else {
            fs.unlinkSync(p.json);
          }
        });
  });
}
