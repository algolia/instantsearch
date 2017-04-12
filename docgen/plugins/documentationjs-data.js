import {forEach, reduce, groupBy, findIndex, find, filter} from 'lodash';
import documentation from 'documentation';

let cachedFiles;

export default function({rootJSFile}) {
  return function(files, metalsmith, done) {
    console.log('before documentationjs');
    documentation.build(rootJSFile, {}, (e, symbols) => {
      if(e) done(e);
      else {
        console.log('after documentationjs');

        mapConnectors(filterConnectors(symbols), symbols, files),

        done();
      }
    });
  };
}

function filterConnectors(symbols) {
  return filter(symbols, (s) => {
    const index = findIndex(s.tags, t => t.title === 'type' && t.type.name === 'Connector');
    return index !== -1;
  });
}
function filterWidgets(symbols) {}

function mapConnectors(connectors, symbols, files) {
  return forEach(connectors, symbol => {
    console.log(symbol.name);
    const fileName = `connectors/${symbol.name}.html`;

    const symbolWithRelatedType = {
      ...symbol,
      relatedTypes: findRelatedTypes(symbol, symbols),
    };

    files[fileName] = {
      mode: '0764',
      contents: '',
      // stats: fileFromMetalsmith && fileFromMetalsmith.stats,
      // filename: fileFromMetalsmith && fileFromMetalsmith.filename,
      title: symbol.name,
      mainTitle: `connectors`, //
      withHeadings: false,
      layout: `connector.pug`,
      category: symbol.kind,
      navWeight: symbol.name === 'InstantSearch' ? 1000 : 0,
      jsdoc: symbolWithRelatedType,
    };
  });
}
function mapWidgets(widgets, symbols) {}

function findRelatedTypes(functionSymbol, symbols) {
  let types = [];
  if(!functionSymbol) return types;

  const findParamsTypes = p => {
    const currentParamType = p.type.type;
    if (currentParamType === 'FunctionType') {
      types = [...types, ...findRelatedTypes(p.type, symbols)]
    } else {
      const currentTypeName = p.name;
      const isCustomType = currentTypeName && currentTypeName !== 'Object' && currentTypeName[0] === currentTypeName[0].toUpperCase();
      if (isCustomType) {
        const typeSymbol = find(symbols, {name: currentTypeName});
        types = [...types, typeSymbol];
      }
    }
  };

  forEach(functionSymbol.params, findParamsTypes);
  forEach(functionSymbol.returns, findParamsTypes);

  return types;
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
