import React from 'react';

export type GoogleMapsContextState = {
  google: typeof google;
  instance: google.maps.Map;
};

const GoogleMapsContext = React.createContext<GoogleMapsContextState>({
  // We mount the context only once the map is created. Thus, we can assume
  // that the value provided through the context is never `undefined`. We can't
  // create an instance at that point, hence the cast.
  google: {} as typeof google,
  instance: {} as google.maps.Map,
});

export default GoogleMapsContext;
