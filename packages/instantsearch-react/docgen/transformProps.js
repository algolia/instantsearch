import {handlers, resolver, utils, parse} from 'react-docgen';
import r from 'recast';

function findPropTypesDefinitions(ast, recast) {
  const definitions = resolver.findAllComponentDefinitions(ast, recast);

  function objectVisitor(path) {
    // Just check that `propTypes` is present on the object.
    const propTypes = utils.getPropertyValuePath(path, 'propTypes');
    if (propTypes) {
      definitions.push(path);
    }
    return false;
  }

  // The default resolver doesn't traverse function bodies, which means that
  // HOCs propTypes are ignored.
  function classVisitor(path) {
    if (utils.isReactComponentClass(path) && definitions.indexOf(path) === -1) {
      definitions.push(path);
    }
    return false;
  }

  recast.visit(ast, {
    visitObjectExpression: objectVisitor,
    visitClassExpression: classVisitor,
  });

  return definitions;
}

function propLocHandler(documentation, path) {
  let propTypesPath = utils.getMemberValuePath(path, 'propTypes');
  if (!propTypesPath) {
    return;
  }
  propTypesPath = utils.resolveToValue(propTypesPath);
  if (!propTypesPath || !r.types.namedTypes.ObjectExpression.check(propTypesPath.node)) {
    return;
  }

  propTypesPath.get('properties').each(propertyPath => {
    if (r.types.namedTypes.Property.check(propertyPath.node)) {
      const propName = utils.getPropertyName(propertyPath);
      const propDescriptor = documentation.getPropDescriptor(propName);
      propDescriptor.loc = {
        start: propertyPath.get('value').value.start,
        end: propertyPath.get('value').value.end,
      };
    }
  });
}

export default function transformProps(code) {
  const result = parse(code, findPropTypesDefinitions, [
    handlers.propTypeHandler,
    propLocHandler,
    handlers.propDocBlockHandler,
    handlers.defaultPropsHandler,
  ]);

  return result.slice().reverse().reduce((res, info) =>
    Object.keys(info.props).slice().reverse().reduce((res2, propName) =>
      res2.slice(0, info.props[propName].loc.start) +
      JSON.stringify(info.props[propName]) +
      res2.slice(info.props[propName].loc.end)
    , res)
  , code);
}
