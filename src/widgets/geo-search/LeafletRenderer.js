import L from 'leaflet';
import { getContainerNode } from '../../lib/utils';

const refineWithMap = ({ refine, paddingBoundingBox, map }) => {
  const bounds = map.getBounds();
  const zoom = map.getZoom();

  const northEastPoint = map
    .project(bounds.getNorthEast(), zoom)
    .add([-paddingBoundingBox.right, paddingBoundingBox.top]);

  const southWestPoint = map
    .project(bounds.getSouthWest(), zoom)
    .add([paddingBoundingBox.left, -paddingBoundingBox.bottom]);

  const ne = map.unproject(northEastPoint);
  const sw = map.unproject(southWestPoint);

  refine({
    northEast: { lat: ne.lat, lng: ne.lng },
    southWest: { lat: sw.lat, lng: sw.lng },
  });
};

const removeMarkers = (markers = []) =>
  markers.forEach(marker => marker.remove());

const addMarkers = (map, items) =>
  items.map(({ name, _geoloc }) => {
    const marker = L.marker([_geoloc.lat, _geoloc.lng]).addTo(map);

    marker.bindPopup(L.popup().setContent(name));

    return marker;
  });

const fitMarkersBounds = renderState => {
  // Ugly hack for enable to detect user interaction
  // rather than interaction trigger by the program
  // see: https://stackoverflow.com/questions/31992278/detect-user-initiated-pan-zoom-operations-on-leaflet
  // see: https://github.com/Leaflet/Leaflet/issues/2934
  renderState.isUserInteraction = false;
  renderState.map.fitBounds(L.featureGroup(renderState.markers).getBounds(), {
    // Disable the animation because the bounds may not be correctly
    // updated with `fitBounds`
    // see: https://github.com/Leaflet/Leaflet/issues/3249
    animate: false,
  });
  renderState.isUserInteraction = true;
};

const renderer = (
  {
    items,
    refine,
    clearMapRefinement,
    toggleRefineOnMapMove,
    isRefineOnMapMove,
    setMapMoveSinceLastRefine,
    hasMapMoveSinceLastRefine,
    isRefinedWithMap,
    widgetParams,
  },
  isFirstRendering
) => {
  const {
    container,
    cssClasses,
    initialZoom,
    initialPosition,
    enableRefineControl,
    paddingBoundingBox,
    renderState,
  } = widgetParams;

  if (isFirstRendering) {
    // Inital component state
    renderState.isMapRender = false;
    renderState.isUserInteraction = true;

    const node = getContainerNode(container);

    // Setup DOM element
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.css';
    document.head.appendChild(linkElement);

    const rootElement = document.createElement('div');
    rootElement.className = cssClasses.root;
    rootElement.style.height = '350px';
    rootElement.style.marginTop = '10px';
    node.appendChild(rootElement);

    const containerButtonElement = document.createElement('div');
    containerButtonElement.style.display = 'flex';
    containerButtonElement.style.justifyContent = 'space-between';
    containerButtonElement.style.marginTop = '10px';
    node.appendChild(containerButtonElement);

    const containerClear = document.createElement('div');
    containerClear.className = 'ais-control ais-control-clear';
    containerButtonElement.appendChild(containerClear);

    const buttonClear = document.createElement('button');
    buttonClear.className = 'ais-control__button-clear';
    buttonClear.textContent = 'Clear the refinement with the current map view';
    buttonClear.disabled = !isRefinedWithMap();
    buttonClear.addEventListener('click', clearMapRefinement);
    containerClear.appendChild(buttonClear);

    const containerControl = document.createElement('div');
    containerControl.className = 'ais-control ais-control--refine';
    containerButtonElement.appendChild(containerControl);

    if (enableRefineControl) {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.className = 'ais-control__checkbox';
      checkbox.type = 'checkbox';
      checkbox.checked = isRefineOnMapMove();
      checkbox.addEventListener('change', toggleRefineOnMapMove);
      label.className = 'ais-control__label';
      label.appendChild(checkbox);
      label.append('Search as I move the map');
      containerControl.appendChild(label);
    }

    if (enableRefineControl || !isRefineOnMapMove()) {
      const button = document.createElement('button');
      button.className = 'ais-control__button';
      button.textContent = 'Redo search here';
      button.disabled = !hasMapMoveSinceLastRefine();
      button.addEventListener('click', () =>
        refineWithMap({
          refine,
          paddingBoundingBox,
          map: renderState.map,
        })
      );
      containerControl.appendChild(button);
    }

    renderState.map = L.map(rootElement);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(renderState.map);

    renderState.map.on('move', () => {
      if (renderState.isUserInteraction) {
        setMapMoveSinceLastRefine();
      }
    });

    renderState.map.on('moveend', () => {
      if (renderState.isUserInteraction && isRefineOnMapMove()) {
        refineWithMap({
          refine,
          paddingBoundingBox,
          map: renderState.map,
        });
      }
    });
  }

  // Display the inital position/zoom only when we don't have result
  // for aovid the map to blink when results are loaded. We don't set the
  // initial view the init function because we don't know the response will
  // contain some hits.
  if (!isFirstRendering && !renderState.isMapRender) {
    renderState.isMapRender = true;

    if (!items.length) {
      renderState.isUserInteraction = false;
      renderState.map.setView(initialPosition, initialZoom);
      renderState.isUserInteraction = true;
    }
  }

  // Markers
  removeMarkers(renderState.markers);
  renderState.markers = addMarkers(renderState.map, items);

  const hasMarkers = renderState.markers.length;
  const enableFitBounds = !hasMapMoveSinceLastRefine() && !isRefinedWithMap();

  if (hasMarkers && enableFitBounds) {
    fitMarkersBounds(renderState);
  }

  // UI
  const buttonClear = document.querySelector('.ais-control__button-clear');
  buttonClear.disabled = !isRefinedWithMap();

  if (enableRefineControl) {
    const label = document.querySelector('.ais-control__label');
    const checkbox = document.querySelector('.ais-control__checkbox');
    const button = document.querySelector('.ais-control__button');

    label.style.display = 'block';
    button.style.display = 'none';
    checkbox.checked = isRefineOnMapMove();
  }

  if (
    !isRefineOnMapMove() &&
    (!enableRefineControl ||
      (enableRefineControl && hasMapMoveSinceLastRefine()))
  ) {
    const button = document.querySelector('.ais-control__button');

    button.style.display = 'block';
    button.disabled = !hasMapMoveSinceLastRefine();

    if (enableRefineControl) {
      const label = document.querySelector('.ais-control__label');
      label.style.display = 'none';
    }
  }
};

export default renderer;
