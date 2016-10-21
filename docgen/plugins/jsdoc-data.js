import collectJson from 'collect-json';
import jsdocParse from 'jsdoc-parse';
import forEach from 'lodash/forEach';
import groupBy from 'lodash/groupBy';

export default function(opts) {
  if (!opts.src) throw new Error('opts.src must be defined');

  return function(files, metalsmith, done) {
    const src = metalsmith.path(opts.src);
    jsdocParse({src, json: true}).pipe(collectJson(dataReady));

    function dataReady(unfilteredSymbols) {
      const symbolsByCategory = groupBy(
        unfilteredSymbols.filter(o => !o.deprecated && o.kind && (o.kind === 'component' || o.kind === 'HOC')),
        'kind'
      );

      forEach(symbolsByCategory, symbols => {
        forEach(symbols, data => {
          const filename = `${data.kind}/${data.name}.html`;
          const customTags = parseCustomTags(data.customTags);
          const isNameUnique = unfilteredSymbols.map(s => s.name).filter(n => n === data.name).length === 1;
          const title = isNameUnique ?
            data.name :
            `${data.name} ${data.category}`;

          files[filename] = {
            ...data,
            ...customTags,
            mode: '0764',
            contents: '',
            title,
            layout: `${data.kind}/${data.category}.pug`,
            category: data.kind,
            navWeight: data.category === 'core' ? 100 : 0,
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
const typeNameValueDescription = /\{(.+)\} (?:(\[?)(\S+?)(?:=(\S+?))?\]? - )?(.+)/;
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
