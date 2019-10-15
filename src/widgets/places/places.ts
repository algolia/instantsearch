import {
  StaticOptions,
  ChangeEvent,
  PlacesInstance,
  ReconfigurableOptions,
} from 'places.js';
import { WidgetFactory } from '../../types';

interface PlacesWidgetOptions extends StaticOptions {
  /**
   * The Algolia Places reference to use.
   *
   * @see https://github.com/algolia/places
   */
  placesReference: (
    options: StaticOptions & ReconfigurableOptions
  ) => PlacesInstance;
  /**
   * The default position when the input is empty.
   */
  defaultPosition?: string[];
}

interface PlacesWidgetState {
  query: string;
  initialLatLngViaIP: boolean | undefined;
  isInitialLatLngViaIPSet: boolean;
}

/**
 * This widget sets the geolocation value for the search based on the selected
 * result in the Algolia Places autocomplete.
 */
const placesWidget: WidgetFactory<PlacesWidgetOptions> = (
  widgetOptions: PlacesWidgetOptions
) => {
  const {
    placesReference = undefined,
    defaultPosition = [],
    ...placesOptions
  } = widgetOptions || {};

  if (typeof placesReference !== 'function') {
    throw new Error(
      'The `placesReference` option requires a valid Places.js reference.'
    );
  }

  const placesAutocomplete = placesReference(placesOptions);

  const state: PlacesWidgetState = {
    query: '',
    initialLatLngViaIP: undefined,
    isInitialLatLngViaIPSet: false,
  };

  return {
    $$type: 'ais.places',

    init({ helper }) {
      placesAutocomplete.on('change', (eventOptions: ChangeEvent) => {
        const {
          suggestion: {
            value,
            latlng: { lat, lng },
          },
        } = eventOptions;

        state.query = value;

        helper
          .setQueryParameter('insideBoundingBox', undefined)
          .setQueryParameter('aroundLatLngViaIP', false)
          .setQueryParameter('aroundLatLng', `${lat},${lng}`)
          .search();
      });

      placesAutocomplete.on('clear', () => {
        state.query = '';

        helper.setQueryParameter('insideBoundingBox', undefined);

        if (defaultPosition.length > 1) {
          helper
            .setQueryParameter('aroundLatLngViaIP', false)
            .setQueryParameter('aroundLatLng', defaultPosition.join(','));
        } else {
          helper
            .setQueryParameter('aroundLatLngViaIP', state.initialLatLngViaIP)
            .setQueryParameter('aroundLatLng', undefined);
        }

        helper.search();
      });
    },

    getWidgetState(uiState, { searchParameters }) {
      const position =
        searchParameters.aroundLatLng || defaultPosition.join(',');
      const hasPositionSet = position !== defaultPosition.join(',');

      if (!hasPositionSet && !state.query) {
        const { places, ...uiStateWithoutPlaces } = uiState;

        return uiStateWithoutPlaces;
      }

      return {
        ...uiState,
        places: {
          query: state.query,
          position,
        },
      };
    },

    getWidgetSearchParameters(searchParameters, { uiState }) {
      const { query = '', position = defaultPosition.join(',') } =
        uiState.places || {};

      state.query = query;

      if (!state.isInitialLatLngViaIPSet) {
        state.isInitialLatLngViaIPSet = true;
        state.initialLatLngViaIP = searchParameters.aroundLatLngViaIP;
      }

      placesAutocomplete.setVal(query);
      placesAutocomplete.close();

      return searchParameters
        .setQueryParameter('insideBoundingBox', undefined)
        .setQueryParameter('aroundLatLngViaIP', false)
        .setQueryParameter('aroundLatLng', position || undefined);
    },
  };
};

export default placesWidget;
