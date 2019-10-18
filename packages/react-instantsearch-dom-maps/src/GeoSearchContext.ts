import React from 'react';

type GeoSearchContextState = {
  isRefineOnMapMove: boolean;
  hasMapMoveSinceLastRefine: boolean;
  toggleRefineOnMapMove: () => void;
  setMapMoveSinceLastRefine: (value: boolean) => void;
  refineWithInstance: (value: google.maps.Map) => void;
};

const GeoSearchContext = React.createContext<GeoSearchContextState>({
  // The actual default value comes from the prop of the component
  // wrapping the `Provider`.
  isRefineOnMapMove: true,
  hasMapMoveSinceLastRefine: false,
  toggleRefineOnMapMove: () => {},
  setMapMoveSinceLastRefine: () => {},
  refineWithInstance: () => {},
});

export default GeoSearchContext;
