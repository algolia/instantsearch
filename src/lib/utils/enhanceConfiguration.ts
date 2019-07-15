import algoliasearchHelper, {
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { Widget } from '../../types';
import mergeSearchParameters from './mergeSearchParameters';

export function enhanceConfiguration(
  configuration: PlainSearchParameters,
  widget: Widget
): PlainSearchParameters {
  if (!widget.getConfiguration) {
    return configuration;
  }

  // Get the relevant partial configuration asked by the widget
  const partialConfiguration = widget.getConfiguration(configuration);

  return mergeSearchParameters(
    new algoliasearchHelper.SearchParameters(configuration),
    new algoliasearchHelper.SearchParameters(partialConfiguration)
  );
}

export default enhanceConfiguration;
