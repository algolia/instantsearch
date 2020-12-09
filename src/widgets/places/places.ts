import {
  StaticOptions,
  ChangeEvent,
  PlacesInstance,
  // no comma, TS is particular about which nodes expose comments
  // eslint-disable-next-line prettier/prettier
  ReconfigurableOptions,
  /** @ts-ignore places is only a peer dependency */
} from 'places.js';
import { WidgetFactory } from '../../types';

export type PlacesWidgetParams = {
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
} & StaticOptions;

type PlacesWidgetState = {
  query: string;
  initialLatLngViaIP: boolean | undefined;
  isInitialLatLngViaIPSet: boolean;
};

export type PlacesWidget = WidgetFactory<
  {},
  PlacesWidgetParams,
  PlacesWidgetParams
>;

/**
 * This widget sets the geolocation value for the search based on the selected
 * result in the Algolia Places autocomplete.
 */
const placesWidget: PlacesWidget = (widgetParams: PlacesWidgetParams) => {
  const { placesReference, defaultPosition = [], ...placesOptions } =
    widgetParams || ({} as PlacesWidgetParams);

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
    $$officialWidget: true,

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

    getWidgetUiState(uiState, { searchParameters }) {
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

    getRenderState(renderState, renderOptions) {
      return {
        ...renderState,
        places: this.getWidgetRenderState(renderOptions),
      };
    },

    getWidgetRenderState() {
      return {
        widgetParams,
      };
    },
  };
};

export default placesWidget;
