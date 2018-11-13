import path from 'path';

import {uniqBy, forEach, reduce, groupBy, findIndex, find, filter, isArray, isObject} from 'lodash';
import documentation from 'documentation';
import remark from 'remark';
import md from '../mdRenderer';

const baseDir = path.resolve(process.cwd(), '..');
function getGithubSource(symbol) {
  return symbol.context.file.split(baseDir)[1].substring(1);
}

function formatMD(ast) {
  if (ast && ast.type === 'root') {
    // 1. extract the raw markdown string from the remark AST
    // 2. use our custom markdown renderer
    return md.render(remark().stringify(ast));
  }
  return ast;
};


function formatAllMD(symbols) {
  if(isArray(symbols)) {
    return symbols.map(s => formatAllMD(s));
  } else if (isObject(symbols)) {
    return reduce(symbols, (acc, propertyValue, propertyName) => {
      if(propertyName === 'description') {
        acc[propertyName] = formatMD(propertyValue);
      } else if(propertyName === 'sees') {
        acc[propertyName] = propertyValue.map(s => formatMD(s));
      } else {
        acc[propertyName] = formatAllMD(propertyValue);
      }
      return acc;
    }, {});
  }
  return symbols;
}

export default function({rootJSFile}) {
  return function documentationjs(files, metalsmith, done) {
    console.log('before documentationjs');
    const out = documentation.build(rootJSFile, {}).then((symbols) => {
      // transform all md like structure to html --> type: 'root' using formatMD
      const mdFormattedSymbols = formatAllMD(symbols);

      mapInstantSearch(
        [
          findInstantSearchFactory(mdFormattedSymbols),
          findInstantSearch(mdFormattedSymbols),
        ],
        mdFormattedSymbols,
        files
      );
      mapConnectors(filterSymbolsByType('Connector', mdFormattedSymbols), mdFormattedSymbols, files),
      mapWidgets(filterSymbolsByType('WidgetFactory', mdFormattedSymbols), mdFormattedSymbols, files),

      metalsmith.metadata().widgetSymbols = groupSymbolsByCategories(filterSymbolsByType('WidgetFactory', mdFormattedSymbols));

      console.log('after documentationjs');
    }, e => {throw e}).catch(e => console.error(e)).finally(done);
  };
}

function findInstantSearch(symbols) {
  return filter(symbols, s => s.name === 'InstantSearch')[0];
}

function findInstantSearchFactory(symbols) {
  return filter(symbols, s => s.name === 'instantsearch')[0];
}

function filterSymbolsByType(type, symbols) {
  return filter(symbols, (s) => {
    const index = findIndex(s.tags, t => {
      const isTypeTag = t.title === 'type';
      if(isTypeTag && !(t.type && t.type.name)) {
        throw new Error('Wrong jsdoc definition for @type in symbol: \n' + JSON.stringify(s, null, 2));
      }
      return isTypeTag && t.type.name === type;
    });
    return index !== -1;
  });
}

function groupSymbolsByCategories(symbols) {
  return groupBy(symbols, (s) => {
    const [ tag ] = filter(s.tags, {title: 'category'});
    return tag && tag.description || 'other';
  });
}

function mapInstantSearch([instantsearchFactory, InstantSearch], symbols, files) {
  const fileName = 'instantsearch.html';

  files[fileName] = {
    mode: '0764',
    contents: '',
    title: instantsearchFactory.name,
    layout: `instantsearch.pug`,
    category: 'instantsearch',
    navWeight: 1,
    instantsearchFactory: {
      ...instantsearchFactory,
      relatedTypes: findRelatedTypes(instantsearchFactory, symbols),
    },
    InstantSearch: {
      ...InstantSearch,
      relatedTypes: findRelatedTypes(InstantSearch, symbols),
    },
    withHeadings: true,
    editable: true,
    githubSource: getGithubSource(InstantSearch),
  };
}

function mapConnectors(connectors, symbols, files) {
  return forEach(connectors, symbol => {
    const fileName = `connectors/${symbol.name}.html`;

    const relatedTypes = findRelatedTypes(symbol, symbols);
    const staticExamples = symbol.tags.filter(t => t.title === 'staticExample');
    const requirements = symbol.tags.find(t => t.title === 'requirements') || { description: '' };

    const symbolWithRelatedType = {
      ...symbol,
      relatedTypes,
      staticExamples,
      requirements: md.render(requirements.description),
    };

    files[fileName] = {
      mode: '0764',
      contents: '',
      title: symbol.name,
      mainTitle: 'connectors',
      layout: `connector.pug`,
      category: 'connectors',
      navWeight: 1,
      jsdoc: symbolWithRelatedType,
      withHeadings: true,
      editable: true,
      githubSource: getGithubSource(symbolWithRelatedType),
    };
  });
}

function mapWidgets(widgets, symbols, files) {
  return forEach(widgets, symbol => {
    const fileName = `widgets/${symbol.name}.html`;

    const relatedTypes = findRelatedTypes(symbol, symbols);
    const staticExamples = symbol.tags.filter(t => t.title === 'staticExample');
    const requirements = symbol.tags.find(t => t.title === 'requirements') || { description: '' };
    const devNovel = symbol.tags.find(t => t.title === 'devNovel') || false;

    const symbolWithRelatedType = {
      ...symbol,
      requirements: md.render(requirements.description),
      devNovel: createDevNovelURL(devNovel),
      relatedTypes,
      staticExamples,
    };

    files[fileName] = {
      mode: '0764',
      contents: '',
      title: symbol.name,
      mainTitle: `widgets`,
      layout: `widget.pug`,
      category: 'widgets',
      navWeight: 1,
      jsdoc: symbolWithRelatedType,
      withHeadings: true,
      editable: true,
      githubSource: getGithubSource(symbolWithRelatedType),
    };
  });
}

function findRelatedTypes(functionSymbol, symbols) {
  let types = [];
  if(!functionSymbol) return types;

  const findParamsTypes = p => {
    if (!p || !p.type) return;
    const currentParamType = p.type.type;
    if (currentParamType === 'FunctionType') {
      types = [...types, ...findRelatedTypes(p.type, symbols)]
    } else if (currentParamType === 'UnionType') {
      forEach(p.type.elements, e => { findParamsTypes({name: e.name, type: e}); });
    } else if (currentParamType === 'OptionalType') {
      findParamsTypes({name: p.type.expression.name, type: p.type.expression});
    } else if (currentParamType === 'TypeApplication') {
      const applications = p.type.applications;
      if(applications && applications.length > 0)
        applications.forEach(a => { findParamsTypes({name: a.name, type: a}); });
    } else if (p.name === '$0') {
      const unnamedParameterType = p.type.name;
      const typeSymbol = find(symbols, {name: unnamedParameterType});
      types = [...types, typeSymbol, ...findRelatedTypes(typeSymbol, symbols)]
    } else {
      if (isCustomType(p.name)) {
        const typeSymbol = find(symbols, {name: p.name});
        if(!typeSymbol) console.warn('Undefined type: ', p.name, JSON.stringify(functionSymbol, null, 2));
        else {
          types = [...types, typeSymbol];
          // iterate over each property to get their types
          forEach(typeSymbol.properties, p => findParamsTypes({name: p.type.name, type: p.type}));
        }
      } else if(isCustomType(p.type.name)){
        const typeSymbol = find(symbols, {name: p.type.name});
        if(!typeSymbol) console.warn('Undefined type: ', p.type.name, JSON.stringify(functionSymbol, null, 2));
        else {
          types = [...types, typeSymbol];
          // iterate over each property to get their types
          if(typeSymbol.properties)
            forEach(typeSymbol.properties, p2 => findParamsTypes({name: p2.type.name, type: p2.type}));
        }
      }
    }
  };

  forEach(functionSymbol.params, findParamsTypes);
  forEach(functionSymbol.returns, findParamsTypes);
  forEach(functionSymbol.properties, findParamsTypes);

  return uniqBy(types, 'name');
}

function isCustomType(name) {
  return name && name !== 'Object' && name[0] === name[0].toUpperCase();
}

function createDevNovelURL(devNovel) {
  return devNovel ? `stories?selectedStory=${devNovel.description}.default` : '';
}
