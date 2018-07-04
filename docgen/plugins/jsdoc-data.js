import collectJson from 'collect-json';
import jsdocParse from 'jsdoc-parse';
import {forEach, groupBy} from 'lodash';
import {hasChanged} from './onlyChanged';
import {join} from 'path';

let cachedFiles;

export default function() {
  return function(files, metalsmith, done) {
    const allFilles = Object
      .entries(files)
      .reduce((memo, [filename, file]) =>
        (/\.jsdoc$/).test(filename) ?
          [...memo, {filename: filename.replace(/\.jsdoc$/, ''), ...file}] :
          memo,
        []
      );

    const filesToParse = allFilles
      .filter(file => hasChanged(file))
      .map(file => file.filename);

    if (cachedFiles) {
      // remove any file from cache not present in filestoparse
      Object.entries(cachedFiles).forEach(([buildFilename, file]) => {
        if (!allFilles.some(({filename}) => file.filename === filename)) {
          delete cachedFiles[buildFilename];
        } else {
          files[buildFilename] = cachedFiles[buildFilename];
        }
      });
    } else {
      cachedFiles = {};
    }

    allFilles.forEach(({filename}) => delete files[`${filename}.jsdoc`]);

    if (filesToParse.length === 0) {
      done();
      return;
    }

    jsdocParse({
      src: filesToParse,
      json: true,
    }).pipe(collectJson(dataReady));

    function dataReady(unfilteredSymbols) {
      const symbolsByCategory = groupBy(
        unfilteredSymbols.filter(
          o => !o.deprecated &&
            o.kind &&
            (o.kind === 'component' || o.kind === 'widget' || o.kind === 'connector')
        ),
        'kind'
      );

      forEach(symbolsByCategory, symbols => {
        forEach(symbols, data => {
          const buildFilename = `${data.kind}s/${data.name}.html`;
          const customTags = parseCustomTags(data.customTags);
          const isNameUnique = unfilteredSymbols.map(s => s.name).filter(n => n === data.name).length === 1;
          const title = isNameUnique ?
            data.name :
            `${data.name} ${data.kind}`;

          const fileFromMetalsmith = allFilles
            .find(
              ({filename}) =>
              filename === join(data.meta.path, data.meta.filename)
            );

          files[buildFilename] = cachedFiles[buildFilename] = {
            ...data,
            ...customTags,
            mode: '0764',
            contents: '',
            stats: fileFromMetalsmith && fileFromMetalsmith.stats,
            filename: fileFromMetalsmith && fileFromMetalsmith.filename,
            title,
            mainTitle: `${data.kind.charAt(0).toUpperCase()}${data.kind.slice(1)}s`, //
            withHeadings: false,
            layout: `${data.kind}.pug`,
            category: data.kind,
            navWeight: data.name === 'InstantSearch' ? 1000 : 0,
          };
        });
      });

      done();
    }
  };
}

/**
 * This regexp aims to parse the following kind of jsdoc tag values:
 *  1 - `{boolean} [showMore=false] - description`
 *  2 - `{boolean} showMore - description`
 * The groups output for 1/ are:
 * [
 *   '{boolean} [showMore=false] - description',
 *   'boolean',
 *   '[',
 *   'showMore',
 *   'false',
 *   'description'
 * ]
 * the first square bracket is  matched in order to detect optional parameter
 */
const typeNameValueDescription = /\{(.+)\} (?:(\[?)(\S+?)(?:=(\S+?))?]? - )?(.+)/;
function parseTypeNameValueDescription(v) {
  const parsed = typeNameValueDescription.exec(v);
  if (!parsed) return null;
  return {
    type: parsed[1],
    isOptional: parsed[2] === '[',
    name: parsed[3],
    defaultValue: parsed[4],
    description: parsed[5],
  };
}

/**
 * This regexp aims to parse simple key description tag values. Example
 *  showMore - container for the show more button
 */
const keyDescription = /(?:(\S+) - )?(.+)/;
function parseKeyDescription(v) {
  const parsed = keyDescription.exec(v);
  if (!parsed) return null;
  return {
    key: parsed[1],
    description: parsed[2],
  };
}

const customTagParsers = {
  proptype: parseTypeNameValueDescription,
  providedproptype: parseTypeNameValueDescription,
  themekey: parseKeyDescription,
  translationkey: parseKeyDescription,
};

function parseCustomTags(customTagObjects) {
  if (!customTagObjects) return {};

  const res = {};
  customTagObjects.forEach(({tag, value}) => {
    const tagValueParser = customTagParsers[tag];
    if (!tagValueParser) return;
    res[tag] = res[tag] || [];
    res[tag].push(tagValueParser(value));
  });

  return res;
}
