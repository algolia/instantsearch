import {uniqBy, forEach, reduce, groupBy, findIndex, find, filter, isArray, isObject} from 'lodash';
import documentation from 'documentation';
import remark from 'remark';
import md from '../mdRenderer';

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
      done();
    }, (e) => done);
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
    const index = findIndex(s.tags, t => t.title === 'type' && t.type.name === type);
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

  const githubSource = InstantSearch.context.file.split('instantsearch.js')[1];

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
    githubSource: githubSource,
  };
}

function mapConnectors(connectors, symbols, files) {
  return forEach(connectors, symbol => {
    const fileName = `connectors/${symbol.name}.html`;

    const symbolWithRelatedType = {
      ...symbol,
      relatedTypes: findRelatedTypes(symbol, symbols),
    };

    const githubSource = 'http://github.com/algolia/instantsearch.js/edit/master' +
      symbolWithRelatedType.context.file.split('instantsearch.js')[1];

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
      githubSource: githubSource,
    };
  });
}

function mapWidgets(widgets, symbols, files) {
  return forEach(widgets, symbol => {
    const fileName = `widgets/${symbol.name}.html`;

    const relatedTypes = findRelatedTypes(symbol, symbols);
    const requirements = symbol.tags.find(t => t.title === 'requirements') || {description: ''};

    const symbolWithRelatedType = {
      ...symbol,
      requirements: md.render(requirements.description),
      relatedTypes,
    };

    const githubSource = symbolWithRelatedType.context.file.split('instantsearch.js/')[1];

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
      githubSource: githubSource,
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
      const currentTypeName = p.name;
      const isCustomType = currentTypeName && currentTypeName !== 'Object' && currentTypeName[0] === currentTypeName[0].toUpperCase();
      if (isCustomType) {
        const typeSymbol = find(symbols, {name: currentTypeName});
        if(!typeSymbol) console.warn('Undefined type: ', currentTypeName);
        else {
          types = [...types, typeSymbol];
          // iterate over each property to get their types
          forEach(typeSymbol.properties, p => findParamsTypes({name: p.type.name, type: p.type}));
        }
      }
    }
  };

  forEach(functionSymbol.params, findParamsTypes);
  forEach(functionSymbol.returns, findParamsTypes);
  forEach(functionSymbol.properties, findParamsTypes);

  return uniqBy(types, 'name');
}
