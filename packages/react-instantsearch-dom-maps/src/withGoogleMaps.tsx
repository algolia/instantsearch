import React from 'react';

import GoogleMapsContext from './GoogleMapsContext';

type Subtract<TProps, TSubstractedProps> = Omit<
  TProps,
  keyof TSubstractedProps
>;

export interface WithGoogleMapsProps {
  google: typeof google;
  googleMapsInstance: google.maps.Map;
}

const withGoogleMaps = <TProps extends WithGoogleMapsProps>(
  Wrapped: React.ComponentType<TProps>
) => {
  const WithGoogleMaps: React.FC<Subtract<TProps, WithGoogleMapsProps>> = (
    props
  ) => (
    <GoogleMapsContext.Consumer>
      {({ google, instance }) => (
        <Wrapped
          // @TODO: remove the cast once TypeScript fixes the issue
          // https://github.com/Microsoft/TypeScript/issues/28938
          {...(props as TProps)}
          google={google}
          googleMapsInstance={instance}
        />
      )}
    </GoogleMapsContext.Consumer>
  );

  return WithGoogleMaps;
};

export default withGoogleMaps;
