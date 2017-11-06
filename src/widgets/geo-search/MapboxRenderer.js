import mapbox from 'mapbox-gl';
import { getContainerNode } from '../../lib/utils.js';

const removeMarkers = (markers = []) =>
  markers.forEach(marker => marker.remove());

const addMarkers = (map, hits) =>
  hits.map(({ _geoloc }) =>
    new mapbox.Marker().setLngLat([_geoloc.lng, _geoloc.lat]).addTo(map)
  );

const refineWithBounds = (refine, bounds) => {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  refine({
    ne: { lat: ne.lat, lng: ne.lng },
    sw: { lat: sw.lat, lng: sw.lng },
  });
};

const renderRedoSearchButton = ({ renderState, refine }) => {
  renderState.containerControl.innerHTML = '';
  const button = document.createElement('button');
  button.textContent = 'Redo search here';
  button.addEventListener('click', () => {
    renderState.hasMapMoveSinceLastRefine = false;
    refineWithBounds(refine, renderState.map.getBounds());
  });
  renderState.containerControl.appendChild(button);
};

const renderer = (
  {
    hits,
    refine,
    clearRefinementWithMap,
    isRefinedWithMap,
    isRefinePositionChanged,
    enableRefineOnMapMove,
    enableControlRefineWithMap,
    widgetParams,
  },
  isFirstRendering
) => {
  const { container, cssClasses, renderState } = widgetParams;

  if (isFirstRendering) {
    const node = getContainerNode(container);

    // Setup state
    renderState.enableRefineOnMapMove = enableRefineOnMapMove;
    renderState.hasMapMoveSinceLastRefine = false;
    renderState.isUserInteraction = true;

    // Setup DOM element
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href =
      'https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.css';
    document.head.appendChild(linkElement);
    renderState.linkElement = linkElement;

    const rootElement = document.createElement('div');
    rootElement.className = cssClasses.root;
    rootElement.style.height = '350px';
    rootElement.style.marginTop = '10px';
    node.appendChild(rootElement);
    renderState.rootElement = rootElement;

    const containerButtonElement = document.createElement('div');
    containerButtonElement.style.display = 'flex';
    containerButtonElement.style.justifyContent = 'space-between';
    containerButtonElement.style.marginTop = '10px';
    node.appendChild(containerButtonElement);
    renderState.containerButtonElement = containerButtonElement;

    const buttonClearMapRefinement = document.createElement('button');
    buttonClearMapRefinement.className = 'ais-button-clear';
    buttonClearMapRefinement.textContent =
      'Clear the refinement with the current map view';
    containerButtonElement.appendChild(buttonClearMapRefinement);
    buttonClearMapRefinement.addEventListener('click', () => {
      renderState.hasMapMoveSinceLastRefine = false;
      clearRefinementWithMap();
    });
    renderState.buttonClearMapRefinement = buttonClearMapRefinement;

    if (enableControlRefineWithMap) {
      const containerControl = document.createElement('div');
      containerControl.className = 'ais-control';
      containerButtonElement.appendChild(containerControl);
      renderState.containerControl = containerControl;
    }

    if (!enableControlRefineWithMap && !renderState.enableRefineOnMapMove) {
      const buttonRefineOnMapMove = document.createElement('button');
      buttonRefineOnMapMove.className = 'ais-button-refine';
      buttonRefineOnMapMove.textContent = 'Redo search here';
      containerButtonElement.appendChild(buttonRefineOnMapMove);
      buttonRefineOnMapMove.addEventListener('click', () => {
        renderState.hasMapMoveSinceLastRefine = false;
        refineWithBounds(refine, renderState.map.getBounds());
      });
      renderState.buttonRefineOnMapMove = buttonRefineOnMapMove;
    }

    // Setup the map
    mapbox.accessToken =
      'pk.eyJ1Ijoic2Ftb3VzcyIsImEiOiJjajlrNHJ2eG80MTh6MndweXp5ZDA3d3k1In0.kFqtSoryexZtULo1GGKe0w';
    renderState.map = new mapbox.Map({
      container: rootElement,
      style: 'mapbox://styles/mapbox/streets-v9',
    });

    renderState.map.addControl(new mapbox.NavigationControl(), 'top-left');

    // Setup the events
    renderState.map.on('dragend', event => {
      if (renderState.enableRefineOnMapMove) {
        renderState.hasMapMoveSinceLastRefine = false;
        refineWithBounds(refine, event.target.getBounds());
      }
    });

    renderState.map.on('zoomend', event => {
      if (renderState.isUserInteraction) {
        renderState.hasMapMoveSinceLastRefine = true;

        // With control
        if (enableControlRefineWithMap && renderState.enableRefineOnMapMove) {
          renderState.hasMapMoveSinceLastRefine = false;
          refineWithBounds(refine, event.target.getBounds());
        }

        if (enableControlRefineWithMap && !renderState.enableRefineOnMapMove) {
          renderRedoSearchButton({
            renderState,
            refine,
          });
        }

        // Without control
        if (!enableControlRefineWithMap && renderState.enableRefineOnMapMove) {
          renderState.hasMapMoveSinceLastRefine = false;
          refineWithBounds(refine, event.target.getBounds());
        }

        if (!enableControlRefineWithMap && !renderState.enableRefineOnMapMove) {
          renderState.buttonRefineOnMapMove.removeAttribute('disabled');
        }
      }
    });
  }

  // Restore hasMapMoveSinceLastRefine when refinement change
  // but the refinement is not with the map
  // ex: with places we can set the refinement with the
  // autocomplete bar & we can move the map without
  // the refine action
  if (isRefinePositionChanged && !isRefinedWithMap) {
    renderState.hasMapMoveSinceLastRefine = false;
  }

  // Register the callback on each render
  // to update the closure scope
  renderState.map.off('dragstart');
  renderState.map.on('dragstart', () => {
    renderState.hasMapMoveSinceLastRefine = true;

    if (enableControlRefineWithMap && !renderState.enableRefineOnMapMove) {
      renderRedoSearchButton({
        renderState,
        refine,
      });
    }

    if (!enableControlRefineWithMap && !renderState.enableRefineOnMapMove) {
      renderState.buttonRefineOnMapMove.removeAttribute('disabled');
    }
  });

  removeMarkers(renderState.markers);

  renderState.markers = addMarkers(renderState.map, hits);

  if (renderState.markers.length && !isRefinedWithMap) {
    renderState.isUserInteraction = false;
    renderState.map.fitBounds(
      renderState.markers.reduce(
        (acc, marker) => acc.extend(marker.getLngLat()),
        new mapbox.LngLatBounds()
      ),
      {
        padding: 25,
        animate: false,
      }
    );
    renderState.isUserInteraction = true;
  }

  if (isRefinedWithMap) {
    renderState.buttonClearMapRefinement.removeAttribute('disabled');
  } else {
    renderState.buttonClearMapRefinement.setAttribute('disabled', true);
  }

  if (enableControlRefineWithMap) {
    renderState.containerControl.innerHTML = '';
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = renderState.enableRefineOnMapMove;
    label.appendChild(checkbox);
    label.append('Search as I move the map');
    checkbox.addEventListener('change', event => {
      renderState.enableRefineOnMapMove = event.currentTarget.checked;
    });
    renderState.containerControl.appendChild(label);
  }

  if (!enableControlRefineWithMap && !renderState.enableRefineOnMapMove) {
    if (renderState.hasMapMoveSinceLastRefine) {
      renderState.buttonRefineOnMapMove.removeAttribute('disabled');
    } else {
      renderState.buttonRefineOnMapMove.setAttribute('disabled', true);
    }
  }
};

export default renderer;
