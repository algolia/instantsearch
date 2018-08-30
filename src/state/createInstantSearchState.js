import qs from 'qs';
import mergeWith from 'lodash/mergeWith';
import union from 'lodash/union';
import isPlainObject from 'lodash/isPlainObject';

export const createInstantSearchState = (context, ...args) => {
  // Create & Parse the context to create the initialUIstate
  const initialUiState = context.url.includes('?')
    ? qs.parse(context.url.slice(context.url.indexOf('?') + 1))
    : {};

  return args.reduce(
    (acc, fn) => {
      const partial = fn(acc);

      const customizer = (a, b) => {
        if (Array.isArray(a)) {
          return union(a, b);
        }

        if (isPlainObject(a)) {
          return mergeWith({}, a, b, customizer);
        }

        return undefined;
      };

      return {
        ...acc,
        ...partial,
        configuration: mergeWith(
          {},
          acc.configuration,
          partial.configuration,
          customizer
        ),
      };
    },
    {
      uiState: initialUiState,
      configuration: {},
    }
  );
};
