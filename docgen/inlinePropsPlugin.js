import {resolve} from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {get} from 'lodash';

import DocProps from './DocProps';
import extractMetadata from './extractMetadata';

const r = resolve.bind(null, __dirname);

export default function inlineProps(files, m, callback) {
  const propMatches = [];
  const entries = [];
  Object.values(files).forEach(file => {
    const contents = file.contents.toString();
    const propMatcher = /<!-- props ([A-Za-z\.]+) (.*) -->/g;
    let match;
    // there can be multiple places in a single file
    // where we try to inline props
    while ((match = propMatcher.exec(contents)) !== null) {
      const [full, exportName, path] = match;
      const fullPath = r(file.path, '..', path);
      if (entries.indexOf(fullPath) === -1) {
        entries.push(fullPath);
      }
      propMatches.push({
        file,
        start: match.index,
        end: match.index + full.length,
        exportName,
        path: fullPath,
      });
    }
  });

  extractMetadata(entries, (err, output) => {
    if (err) {
      callback(err);
      return;
    }

    // Reversing allows us to do in place replace without altering indexes
    propMatches.slice().reverse().forEach(match => {
      const contents = match.file.contents.toString();
      const propTypes = get(output[match.path], match.exportName).propTypes;
      const inlinedContents =
        contents.slice(0, match.start) +
        ReactDOMServer.renderToStaticMarkup(
          <DocProps propTypes={propTypes} prefix={match.exportName} />
        ) +
        contents.slice(match.end);
      match.file.contents = new Buffer(inlinedContents);
    });

    callback();
  });
}
