import markdown from 'markdown-it';
import highlight from '../syntaxHighlighting';

const md = markdown();

// this plugin provides ATM one helper to easily compute the publicPath of assets
export default function helpers(filenames, metalsmith, cb) {
  metalsmith.metadata().h = {
    markdown(src) {
      return md.render(src);
    },
    highlight(src, opts) {
      const lang = opts && opts.lang;
      const inline = opts && opts.inline;
      const runnable = opts && opts.runnable;

      return highlight(src, lang, inline, runnable);
    },
    maybeActive(navPath, singlePathOrArrayOfPaths) {
      const pathsToTest = [].concat(singlePathOrArrayOfPaths);
      return pathsToTest.some(pathToTest => navPath.indexOf(pathToTest) === 0) ?
        'active' :
        '';
    },
  };

  cb();
}
