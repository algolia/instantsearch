import marked from 'marked';
import {resolve} from 'path';
import {parse} from 'doctrine';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import DocProps from './DocProps';
import renderer from './renderer';
import extractMetadata from './extractMetadata';

const r = resolve.bind(null, __dirname);

function applyTag(meta, tag) {
  if (tag.title === 'private') {
    return {
      ...meta,
      private: true,
    };
  }
  return meta;
}

function getMeta(type) {
  const data = type.description ? parseDescription(type.description) : {};
  return {
    ...(data.tags ? data.tags.reduce(applyTag, {}) : {}),
    description: data.description,
  };
}

function parseType(type) {
  if (type.name === 'arrayOf') {
    return {
      ...type,
      value: parseType(type.value),
    };
  }
  if (type.name === 'shape') {
    return {
      ...type,
      value: Object.entries(type.value).reduce((res, [key, val]) => ({
        ...res,
        [key]: parseType(val),
      }), {}),
    };
  }
  if (type.name === 'union') {
    return {
      ...type,
      value: type.value.map(v => parseType(v)),
    };
  }

  const meta = getMeta(type);

  return {
    ...type,
    ...meta,
  };
}

function parseDescription(desc) {
  const data = parse(desc);
  const description = marked(data.description, {renderer});
  return {
    ...data,
    description,
  };
}

export default function inlineProps(files, m, callback) {
  const propMatches = [];
  const entries = [];
  Object.values(files).forEach(file => {
    const contents = file.contents.toString();
    const propMatcher = /<!-- props ([A-Za-z]+) (.*) -->/g;
    let match;
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
      const propTypes = output[match.path][match.exportName].propTypes;
      const props = Object.keys(propTypes).sort().map(propName => ({
        name: propName,
        type: parseType(propTypes[propName].type),
        defaultValue: propTypes[propName].defaultValue,
        required: propTypes[propName].required,
        ...getMeta(propTypes[propName]),
      }));
      const inlinedContents =
        contents.slice(0, match.start) +
        ReactDOMServer.renderToStaticMarkup(
          <DocProps props={props} />
        ) +
        contents.slice(match.end);
      match.file.contents = new Buffer(inlinedContents);
    });

    callback();
  });
}
