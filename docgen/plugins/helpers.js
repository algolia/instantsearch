import highlight from '../syntaxHighlighting';
import md from '../mdRenderer';

// this plugin provides ATM one helper to easily compute the publicPath of assets
export default function helpers(filenames, metalsmith, cb) {
  metalsmith.metadata().h = {
    markdown(src) {
      return md.render(src);
    },
    highlight(src, opts) {
      const lang = opts && opts.lang;
      return highlight(src, lang);
    },
    maybeActive(navPath, singlePathOrArrayOfPaths) {
      const pathsToTest = [].concat(singlePathOrArrayOfPaths);
      return pathsToTest.some(pathToTest => navPath.indexOf(pathToTest) === 0)
        ? 'active'
        : '';
    },
  };

  cb();
}
