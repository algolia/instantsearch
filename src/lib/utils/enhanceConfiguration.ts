import { SearchParameters, Widget } from '../../types';
import findIndex from './findIndex';
import mergeDeep from './mergeDeep';

export function enhanceConfiguration(
  configuration: Partial<SearchParameters>,
  widget: Widget
): Partial<SearchParameters> {
  if (!widget.getConfiguration) {
    return configuration;
  }

  // Get the relevant partial configuration asked by the widget
  const partialConfiguration = widget.getConfiguration(configuration);

  if (!partialConfiguration) {
    return configuration;
  }

  if (!partialConfiguration.hierarchicalFacets) {
    return mergeDeep(configuration, partialConfiguration);
  }

  const {
    hierarchicalFacets,
    ...partialWithoutHierarchcialFacets
  } = partialConfiguration;

  // The `mergeDeep` function uses a `uniq` function under the hood, but the
  // implementation does not support arrays of objects (we also had the issue
  // with the Lodash version). The `hierarchicalFacets` attribute is an array
  // of objects, which means that this attribute is never deduplicated. It
  // becomes problematic when widgets are frequently added/removed, since the
  // function `enhanceConfiguration` is called at each operation.
  // https://github.com/algolia/instantsearch.js/issues/3278
  const configurationWithHierarchicalFacets = {
    ...configuration,
    hierarchicalFacets: hierarchicalFacets.reduce((facets, facet) => {
      const index = findIndex(facets, _ => _.name === facet.name);

      if (index === -1) {
        return facets.concat(facet);
      }

      const nextFacets = facets.slice();
      nextFacets.splice(index, 1, facet);

      return nextFacets;
    }, configuration.hierarchicalFacets || []),
  };

  return mergeDeep(
    configurationWithHierarchicalFacets,
    partialWithoutHierarchcialFacets
  );
}

export default enhanceConfiguration;
