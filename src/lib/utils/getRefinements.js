import find from 'lodash/find';
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import unescapeRefinement from './unescapeRefinement';

function getRefinement(state, type, attributeName, name, resultsFacets) {
  const res = { type, attributeName, name };
  let facet = find(resultsFacets, { name: attributeName });
  let count;

  if (type === 'hierarchical') {
    const facetDeclaration = state.getHierarchicalFacetByName(attributeName);
    const split = name.split(facetDeclaration.separator);

    for (let i = 0; facet !== undefined && i < split.length; ++i) {
      facet = find(facet.data, { name: split[i] });
    }

    count = get(facet, 'count');
  } else {
    count = get(facet, `data["${res.name}"]`);
  }

  const exhaustive = get(facet, 'exhaustive');

  if (count !== undefined) {
    res.count = count;
  }

  if (exhaustive !== undefined) {
    res.exhaustive = exhaustive;
  }

  return res;
}

function getRefinements(results, state, clearsQuery) {
  const res = [];

  forEach(state.facetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(state, 'facet', attributeName, name, results.facets)
      );
    });
  });

  forEach(state.facetsExcludes, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push({ type: 'exclude', attributeName, name, exclude: true });
    });
  });

  forEach(state.disjunctiveFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(
          state,
          'disjunctive',
          attributeName,
          // we unescapeRefinement any disjunctive refined value since they can be escaped
          // when negative numeric values search `escapeRefinement` usage in code
          unescapeRefinement(name),
          results.disjunctiveFacets
        )
      );
    });
  });

  forEach(state.hierarchicalFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(
          state,
          'hierarchical',
          attributeName,
          name,
          results.hierarchicalFacets
        )
      );
    });
  });

  forEach(state.numericRefinements, (operators, attributeName) => {
    forEach(operators, (values, operator) => {
      forEach(values, value => {
        res.push({
          type: 'numeric',
          attributeName,
          name: `${value}`,
          numericValue: value,
          operator,
        });
      });
    });
  });

  forEach(state.tagRefinements, name => {
    res.push({ type: 'tag', attributeName: '_tags', name });
  });

  if (clearsQuery && state.query && state.query.trim()) {
    res.push({
      attributeName: 'query',
      type: 'query',
      name: state.query,
      query: state.query,
    });
  }

  return res;
}

export default getRefinements;
