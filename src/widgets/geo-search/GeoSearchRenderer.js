import React, { render } from 'preact-compat';
import { getContainerNode, prepareTemplateProps } from '../../lib/utils';
import GeoSearchControls from '../../components/GeoSearchControls/GeoSearchControls';

const refineWithMap = ({ refine, paddingBoundingBox, mapInstance }) => {
  // Function for compute the projection of LatLng to Point (pixel)
  // Builtin in Leaflet: myMapInstance.project(LatLng, zoom)
  // http://krasimirtsonev.com/blog/article/google-maps-api-v3-convert-latlng-object-to-actual-pixels-point-object
  // http://leafletjs.com/reference-1.2.0.html#map-project
  const scale = Math.pow(2, mapInstance.getZoom());

  const northEastPoint = mapInstance
    .getProjection()
    .fromLatLngToPoint(mapInstance.getBounds().getNorthEast());

  northEastPoint.x = northEastPoint.x - paddingBoundingBox.right / scale;
  northEastPoint.y = northEastPoint.y + paddingBoundingBox.top / scale;

  const southWestPoint = mapInstance
    .getProjection()
    .fromLatLngToPoint(mapInstance.getBounds().getSouthWest());

  southWestPoint.x = southWestPoint.x + paddingBoundingBox.right / scale;
  southWestPoint.y = southWestPoint.y - paddingBoundingBox.bottom / scale;

  const ne = mapInstance.getProjection().fromPointToLatLng(northEastPoint);
  const sw = mapInstance.getProjection().fromPointToLatLng(southWestPoint);

  refine({
    northEast: { lat: ne.lat(), lng: ne.lng() },
    southWest: { lat: sw.lat(), lng: sw.lng() },
  });
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

  const containerNode = getContainerNode(container);

  if (isFirstRendering) {
    renderState.isUserInteraction = true;
    renderState.isPendingRefine = false;
    renderState.markers = [];

    const rootElement = document.createElement('div');
    rootElement.className = cssClasses.root;
    containerNode.appendChild(rootElement);

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

    renderState.mapInstance.addListener('center_changed', () => {
      if (renderState.isUserInteraction) {
        setMapMoveSinceLastRefine();
      }
    });

    renderState.mapInstance.addListener('zoom_changed', () => {
      if (renderState.isUserInteraction) {
        renderState.isPendingRefine = true;
        setMapMoveSinceLastRefine();
      }
    });

    renderState.mapInstance.addListener('dragstart', () => {
      if (renderState.isUserInteraction) {
        renderState.isPendingRefine = true;
      }
    });

    renderState.mapInstance.addListener('idle', () => {
      if (
        renderState.isUserInteraction &&
        renderState.isPendingRefine &&
        isRefineOnMapMove()
      ) {
        renderState.isPendingRefine = false;

        refineWithMap({
          mapInstance: renderState.mapInstance,
          refine,
          paddingBoundingBox,
          googleReference,
        });
      }
    });

    renderState.templateProps = prepareTemplateProps({
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });

    return;
  }

  if (!items.length && !isRefinedWithMap()) {
    const intialMapPosition = position || initialPosition;

    renderState.isUserInteraction = false;
    renderState.mapInstance.setCenter(intialMapPosition);
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
          markerOptions.events[eventName](event, item);
        });
      });

      return marker;
    })
  );

  // Fit the map to the markers when needed
  const hasMarkers = renderState.markers.length;
  const enableFitBounds = !hasMapMoveSinceLastRefine() && !isRefinedWithMap();

  if (hasMarkers && enableFitBounds) {
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
          googleReference,
        })}
      onClearClick={clearMapRefinement}
      templateProps={renderState.templateProps}
    />,
    containerNode.querySelector(`.${cssClasses.controls}`)
  );
};

export default renderer;
