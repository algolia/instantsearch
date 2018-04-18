import React, { render } from 'preact-compat';
import { prepareTemplateProps } from '../../lib/utils';
import GeoSearchControls from '../../components/GeoSearchControls/GeoSearchControls';

const INWARD = -1;
const OUTWARD = 1;
/**
 * @param {object} bounds the bounds
 * @param {number} direction -1 is inward and 1 is outward (use INWARD and OUTWARD)
 * @return {object} bounds that are usable by applyZoomBounds
 */
const getZoomBounds = (bounds, direction) => ({
  top: bounds.top * -1 * direction,
  right: bounds.right * direction,
  bottom: bounds.bottom * direction,
  left: bounds.left * -1 * direction,
});

const applyZoomBounds = ({ zoomBounds, bounds, mapInstance }) => {
  const scale = Math.pow(2, mapInstance.getZoom()) || 1;

  const { northEast, southWest } = bounds;

  const toPoint = latLng =>
    mapInstance.getProjection().fromLatLngToPoint(latLng);

  const northEastPoint = toPoint(northEast);
  const southWestPoint = toPoint(southWest);

  northEastPoint.x = northEastPoint.x + zoomBounds.right / scale;
  northEastPoint.y = northEastPoint.y + zoomBounds.top / scale;

  southWestPoint.x = southWestPoint.x + zoomBounds.left / scale;
  southWestPoint.y = southWestPoint.y + zoomBounds.bottom / scale;

  const ne = mapInstance.getProjection().fromPointToLatLng(northEastPoint);
  const sw = mapInstance.getProjection().fromPointToLatLng(southWestPoint);

  return {
    northEast: { lat: ne.lat(), lng: ne.lng() },
    southWest: { lat: sw.lat(), lng: sw.lng() },
  };
};

const addPaddingToBounds = ({ paddingBoundingBox, bounds, mapInstance }) =>
  applyZoomBounds({
    zoomBounds: getZoomBounds(paddingBoundingBox, OUTWARD),
    bounds,
    mapInstance,
  });

const substractPaddingToBounds = ({
  paddingBoundingBox,
  bounds,
  mapInstance,
}) =>
  applyZoomBounds({
    zoomBounds: getZoomBounds(paddingBoundingBox, INWARD),
    bounds,
    mapInstance,
  });

const refineWithMap = ({ refine, paddingBoundingBox, mapInstance }) => {
  refine(
    substractPaddingToBounds({
      paddingBoundingBox,
      mapInstance,
      bounds: {
        northEast: mapInstance.getBounds().getNorthEast(),
        southWest: mapInstance.getBounds().getSouthWest(),
      },
    })
  );
};

const collectMarkersForNextRender = (markers, nextIds) =>
  markers.reduce(
    ([update, exit], marker) => {
      const persist = nextIds.includes(marker.__id);

      return persist
        ? [update.concat(marker), exit]
        : [update, exit.concat(marker)];
    },
    [[], []]
  );

const renderer = (
  {
    items,
    position,
    refine,
    clearMapRefinement,
    toggleRefineOnMapMove,
    isRefineOnMapMove,
    getSearchBounds,
    setMapMoveSinceLastRefine,
    hasMapMoveSinceLastRefine,
    isRefinedWithMap,
    widgetParams,
    instantSearchInstance,
  },
  isFirstRendering
) => {
  const {
    container,
    googleReference,
    cssClasses,
    templates,
    initialZoom,
    initialPosition,
    enableClearMapRefinement,
    enableRefineControl,
    paddingBoundingBox,
    mapOptions,
    createMarker,
    markerOptions,
    renderState,
  } = widgetParams;

  if (isFirstRendering) {
    renderState.isUserInteraction = true;
    renderState.isPendingRefine = false;
    renderState.markers = [];

    const rootElement = document.createElement('div');
    rootElement.className = cssClasses.root;
    container.appendChild(rootElement);

    const mapElement = document.createElement('div');
    mapElement.className = cssClasses.map;
    rootElement.appendChild(mapElement);

    const controlElement = document.createElement('div');
    controlElement.className = cssClasses.controls;
    rootElement.appendChild(controlElement);

    renderState.mapInstance = new googleReference.maps.Map(mapElement, {
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: false,
      zoomControlOptions: {
        position: googleReference.maps.ControlPosition.LEFT_TOP,
      },
      ...mapOptions,
    });

    const setupListenersWhenMapIsReady = () => {
      const onChange = () => {
        if (renderState.isUserInteraction) {
          setMapMoveSinceLastRefine();

          if (isRefineOnMapMove()) {
            renderState.isPendingRefine = true;
          }
        }
      };

      renderState.mapInstance.addListener('center_changed', onChange);
      renderState.mapInstance.addListener('zoom_changed', onChange);
      renderState.mapInstance.addListener('dragstart', onChange);

      renderState.mapInstance.addListener('idle', () => {
        if (renderState.isUserInteraction && renderState.isPendingRefine) {
          renderState.isPendingRefine = false;

          refineWithMap({
            mapInstance: renderState.mapInstance,
            refine,
            paddingBoundingBox,
          });
        }
      });
    };

    googleReference.maps.event.addListenerOnce(
      renderState.mapInstance,
      'idle',
      setupListenersWhenMapIsReady
    );

    renderState.templateProps = prepareTemplateProps({
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });

    return;
  }

  if (!items.length && !isRefinedWithMap() && !hasMapMoveSinceLastRefine()) {
    const initialMapPosition = position || initialPosition;

    renderState.isUserInteraction = false;
    renderState.mapInstance.setCenter(initialMapPosition);
    renderState.mapInstance.setZoom(initialZoom);
    renderState.isUserInteraction = true;
  }

  // Collect markers that need to be updated or removed
  const nextItemsIds = items.map(_ => _.objectID);
  const [updateMarkers, exitMarkers] = collectMarkersForNextRender(
    renderState.markers,
    nextItemsIds
  );

  // Collect items that will be added
  const updateMarkerIds = updateMarkers.map(_ => _.__id);
  const nextPendingItems = items.filter(
    item => !updateMarkerIds.includes(item.objectID)
  );

  // Remove all markers that need to be removed
  exitMarkers.forEach(marker => marker.setMap(null));

  // Create the markers from the items
  renderState.markers = updateMarkers.concat(
    nextPendingItems.map(item => {
      const marker = createMarker({
        map: renderState.mapInstance,
        item,
      });

      Object.keys(markerOptions.events).forEach(eventName => {
        marker.addListener(eventName, event => {
          markerOptions.events[eventName]({
            map: renderState.mapInstance,
            event,
            item,
            marker,
          });
        });
      });

      return marker;
    })
  );

  // Fit the map to the markers when needed
  const hasMarkers = renderState.markers.length;
  const boundingBoxFromConnector = getSearchBounds();
  const enableFitBounds = !hasMapMoveSinceLastRefine() && !isRefinedWithMap();

  if (boundingBoxFromConnector && isRefinedWithMap()) {
    renderState.isUserInteraction = false;
    const boundsWithLatLng = {
      southWest: new googleReference.maps.LatLng(
        boundingBoxFromConnector.southWest.lat,
        boundingBoxFromConnector.southWest.lng
      ),
      northEast: new googleReference.maps.LatLng(
        boundingBoxFromConnector.northEast.lat,
        boundingBoxFromConnector.northEast.lng
      ),
    };
    const boundsWithPadding = addPaddingToBounds({
      bounds: boundsWithLatLng,
      paddingBoundingBox,
      mapInstance: renderState.mapInstance,
    });
    renderState.mapInstance.fitBounds(
      new googleReference.maps.LatLngBounds(
        boundsWithPadding.southWest,
        boundsWithPadding.northEast
      ),
      0
    );
    renderState.isUserInteraction = true;
  } else if (hasMarkers && enableFitBounds) {
    const bounds = renderState.markers.reduce(
      (acc, marker) => acc.extend(marker.getPosition()),
      new googleReference.maps.LatLngBounds()
    );

    renderState.isUserInteraction = false;
    renderState.mapInstance.fitBounds(bounds);
    renderState.isUserInteraction = true;
  }

  render(
    <GeoSearchControls
      cssClasses={cssClasses}
      enableRefineControl={enableRefineControl}
      enableClearMapRefinement={enableClearMapRefinement}
      isRefineOnMapMove={isRefineOnMapMove()}
      isRefinedWithMap={isRefinedWithMap()}
      hasMapMoveSinceLastRefine={hasMapMoveSinceLastRefine()}
      onRefineToggle={toggleRefineOnMapMove}
      onRefineClick={() =>
        refineWithMap({
          mapInstance: renderState.mapInstance,
          refine,
          paddingBoundingBox,
        })
      }
      onClearClick={clearMapRefinement}
      templateProps={renderState.templateProps}
    />,
    container.querySelector(`.${cssClasses.controls}`)
  );
};

export default renderer;
