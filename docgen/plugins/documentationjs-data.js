import {forEach, reduce, groupBy, findIndex, find, filter, isArray, isObject} from 'lodash';
import documentation from 'documentation';
import remark from 'remark';
import html from 'remark-html';

function formatMD(ast) {
  if (ast) {
    return remark().use(html).stringify(ast);
  }
};


function formatAllMD(symbols) {
  if(isArray(symbols)) {
    return symbols.map(s => formatAllMD(s));
  } else if (isObject(symbols)) {
    return reduce(symbols, (acc, propertyValue, propertyName) => {
      if(propertyName === 'description' && propertyValue && propertyValue.type === 'root') {
        acc[propertyName] = formatMD(propertyValue); 
      } else {
        acc[propertyName] = formatAllMD(propertyValue);
      }
      return acc;
    }, {});
  }
  return symbols;
}

let cachedFiles;

export default function({rootJSFile}) {
  return function(files, metalsmith, done) {
    console.log('before documentationjs');
    documentation.build(rootJSFile, {}, (e, symbols) => {
      if(e) done(e);
      else {
        // transform all md like structure to html --> type: 'root' using formatMD
        const mdFormattedSymbols = formatAllMD(symbols);

        mapConnectors(filterSymbolsByType('Connector', mdFormattedSymbols), mdFormattedSymbols, files),
        mapWidgets(filterSymbolsByType('WidgetFactory', mdFormattedSymbols), mdFormattedSymbols, files),

        console.log('after documentationjs');
        done();
      }
    });
  };
}

function filterSymbolsByType(type, symbols) {
  return filter(symbols, (s) => {
    const index = findIndex(s.tags, t => t.title === 'type' && t.type.name === type);
    return index !== -1;
  });
}

function mapConnectors(connectors, symbols, files) {
  return forEach(connectors, symbol => {
    // console.log(symbol.name);
    const fileName = `connectors/${symbol.name}.html`;

    const symbolWithRelatedType = {
      ...symbol,
      relatedTypes: findRelatedTypes(symbol, symbols),
    };

    files[fileName] = {
      mode: '0764',
      contents: '',
      title: symbol.name,
      mainTitle: 'connectors',
      withHeadings: false,
      layout: `connector.pug`,
      category: 'connectors',
      navWeight: 1,
      jsdoc: symbolWithRelatedType,
    };
  });
}

function mapWidgets(widgets, symbols, files) {
  return forEach(widgets, symbol => {
    // console.log(symbol.name);
    const fileName = `widgets/${symbol.name}.html`;

    const relatedTypes = findRelatedTypes(symbol, symbols);

    const symbolWithRelatedType = {
      ...symbol,
      relatedTypes,
    };


    files[fileName] = {
      mode: '0764',
      contents: '',
      title: symbol.name,
      mainTitle: `widgets`,
      withHeadings: false,
      layout: `widget.pug`,
      category: 'widgets',
      navWeight: 1,
      jsdoc: symbolWithRelatedType,
    };
  });
}

function findRelatedTypes(functionSymbol, symbols) {
  let types = [];
  if(!functionSymbol) return types;

  const findParamsTypes = p => {
    if (!p) return;
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
          forEach(typeSymbol.properties, p => findParamsTypes(p));
        }
      }
    }
  };

  forEach(functionSymbol.params, findParamsTypes);
  forEach(functionSymbol.returns, findParamsTypes);
  forEach(functionSymbol.properties, findParamsTypes);

  return types;
}
