import {basename, dirname, extname} from 'path';
import md from '../mdRenderer';

const isMarkdown = filepath => (/\.md|\.markdown/).test(extname(filepath));

export default function markdown(files, metalsmith, done) {
  Object.keys(files).forEach(file => {
    if (!isMarkdown(file)) return;
    const data = files[file];
    const dir = dirname(file);
    let html = `${basename(file, extname(file))}.html`;
    if (dir !== '.') html = `${dir}/${html}`;
    const str = md.render(data.contents.toString(), {path: html});
    data.contents = new Buffer(str);
    delete files[file];
    files[html] = data;
  });

  done();
}
