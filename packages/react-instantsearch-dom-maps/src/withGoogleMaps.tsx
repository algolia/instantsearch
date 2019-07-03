import React from 'react';
import PropTypes from 'prop-types';

type Subtract<TProps, TSubstractedProps> = Omit<
  TProps,
  keyof TSubstractedProps
>;

// @TODO: Move to GoogleMaps once it's migrated to TypeScript
export interface GoogleMapsContext {
  __ais_geo_search__google_maps__: {
    google: typeof google; // eslint-disable-line no-undef
    instance: google.maps.Map;
  };
}

export interface WithGoogleMapsProps {
  google: typeof google; // eslint-disable-line no-undef
  googleMapsInstance: google.maps.Map;
}

const withGoogleMaps = <TProps extends WithGoogleMapsProps>(
  Wrapped: React.ComponentType<TProps>
) => {
  const WithGoogleMaps: React.FC<Subtract<TProps, WithGoogleMapsProps>> = (
    props,
    context: GoogleMapsContext
  ) => {
    const { google, instance } = context.__ais_geo_search__google_maps__;

    return (
      <Wrapped
        // @TODO: remove the cast once TypeScript fixes the issue
        // https://github.com/Microsoft/TypeScript/issues/28938
        {...(props as TProps)}
        google={google}
        googleMapsInstance={instance}
      />
    );
  };

  WithGoogleMaps.contextTypes = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    __ais_geo_search__google_maps__: PropTypes.shape({
      google: PropTypes.object,
      instance: PropTypes.object,
    }),
  };

  return WithGoogleMaps;
};

export default withGoogleMaps;
