import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import { Widget } from '../../types';
import mergeSearchParameters from './mergeSearchParameters';

function enhanceConfiguration(
  configuration: SearchParameters,
  widget: Widget
): SearchParameters {
  if (!widget.getConfiguration) {
    return configuration;
  }

  // Get the relevant partial configuration asked by the widget
  const partialConfiguration = widget.getConfiguration(configuration);

  return mergeSearchParameters(
    configuration,
    new algoliasearchHelper.SearchParameters(partialConfiguration)
  );
}

export default enhanceConfiguration;
