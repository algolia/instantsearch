/** @jsx h */

import { h, render } from 'preact';
import { prepareTemplateProps } from '../../lib/utils';
import GeoSearchControls from '../../components/GeoSearchControls/GeoSearchControls';

const refineWithMap = ({ refine, mapInstance }) =>
  refine({
    northEast: mapInstance
      .getBounds()
      .getNorthEast()
      .toJSON(),
    southWest: mapInstance
      .getBounds()
      .getSouthWest()
      .toJSON(),
  });

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

const createBoundingBoxFromMarkers = (google, markers) => {
  const latLngBounds = markers.reduce(
    (acc, marker) => acc.extend(marker.getPosition()),
    new google.maps.LatLngBounds()
  );

  return {
    northEast: latLngBounds.getNorthEast().toJSON(),
    southWest: latLngBounds.getSouthWest().toJSON(),
  };
};

const lockUserInteraction = (renderState, functionThatAltersTheMapPosition) => {
  renderState.isUserInteraction = false;
  functionThatAltersTheMapPosition();
  renderState.isUserInteraction = true;
};

const renderer = (
  {
    items,
    position,
    currentRefinement,
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
    enableRefine,
    enableClearMapRefinement,
    enableRefineControl,
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

    const treeElement = document.createElement('div');
    treeElement.className = cssClasses.tree;
    rootElement.appendChild(treeElement);

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
        if (renderState.isUserInteraction && enableRefine) {
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

  const shouldUpdate = !hasMapMoveSinceLastRefine();

  // We use this value for differentiate the padding to apply during
  // fitBounds. When we don't have a currenRefinement (boundingBox)
  // we let Google Maps compute the automatic padding. But when we
  // provide the currentRefinement we explicitly set the padding
  // to `0` otherwise the map will decrease the zoom on each refine.
  const boundingBoxPadding = currentRefinement ? 0 : null;
  const boundingBox =
    !currentRefinement && Boolean(renderState.markers.length)
      ? createBoundingBoxFromMarkers(googleReference, renderState.markers)
      : currentRefinement;

  if (boundingBox && shouldUpdate) {
    lockUserInteraction(renderState, () => {
      renderState.mapInstance.fitBounds(
        new googleReference.maps.LatLngBounds(
          boundingBox.southWest,
          boundingBox.northEast
        ),
        boundingBoxPadding
      );
    });
  } else if (shouldUpdate) {
    lockUserInteraction(renderState, () => {
      renderState.mapInstance.setCenter(position || initialPosition);
      renderState.mapInstance.setZoom(initialZoom);
    });
  }

  render(
    <GeoSearchControls
      cssClasses={cssClasses}
      enableRefine={enableRefine}
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
        })
      }
      onClearClick={clearMapRefinement}
      templateProps={renderState.templateProps}
    />,
    container.querySelector(`.${cssClasses.tree}`)
  );
};

export default renderer;
