import postcss from 'postcss';
import syntax from 'postcss-scss';
import autoprefixer from 'autoprefixer';

export default function sassAutoprefixer(files, metalsmith, done) {
  const processor = postcss([autoprefixer]);
  Object
    .keys(files)
    .filter(file => (/\.css$/).test(file))
    .forEach(file => {
      const originalContent = files[file].contents.toString();
      const autoprefixedContent = processor.process(originalContent, {syntax}).css;
      files[file].contents = new Buffer(autoprefixedContent);
    });

  done();
}
