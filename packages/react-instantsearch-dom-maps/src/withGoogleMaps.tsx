import React from 'react';
import PropTypes from 'prop-types';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

// @TODO: Move to GoogleMaps once it's migrated to TypeScript
export interface GoogleMapsContext {
  __ais_geo_search__google_maps__: {
    google: typeof google;
    instance: google.maps.Map;
  };
}

export interface WithGoogleMapsProps {
  google: typeof google;
  googleMapsInstance: google.maps.Map;
}

const withGoogleMaps = <Props extends WithGoogleMapsProps>(
  Wrapped: React.ComponentType<Props>
) => {
  const WithGoogleMaps: React.FC<Subtract<Props, WithGoogleMapsProps>> = (
    props,
    context: GoogleMapsContext
  ) => {
    const { google, instance } = context.__ais_geo_search__google_maps__;

    return (
      <Wrapped
        // @TODO: remove the cast once TypeScript fixes the issue
        // https://github.com/Microsoft/TypeScript/issues/28938
        {...(props as Props)}
        google={google}
        googleMapsInstance={instance}
      />
    );
  };

  WithGoogleMaps.contextTypes = {
    __ais_geo_search__google_maps__: PropTypes.shape({
      google: PropTypes.object,
      instance: PropTypes.object,
    }),
  };

  return WithGoogleMaps;
};

export default withGoogleMaps;
