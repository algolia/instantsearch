import L from 'leaflet';
import { getContainerNode } from '../../lib/utils.js';

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
    ne: { lat: ne.lat, lng: ne.lng },
    sw: { lat: sw.lat, lng: sw.lng },
  });
};

const removeMarkers = (markers = []) =>
  markers.forEach(marker => marker.remove());

const addMarkers = (map, items) =>
  items.map(({ _geoloc }) => L.marker([_geoloc.lat, _geoloc.lng]).addTo(map));

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

const renderClearRefinementButton = ({
  renderState,
  clearMapRefinement,
  isRefinedWithMap,
}) => {
  renderState.containerClear.innerHTML = '';
  const button = document.createElement('button');
  button.textContent = 'Clear the refinement with the current map view';
  button.disabled = !isRefinedWithMap;
  button.addEventListener('click', clearMapRefinement);
  renderState.containerClear.appendChild(button);
};

const renderControlElement = ({
  renderState,
  toggleRefineOnMapMove,
  enableRefineOnMapMove,
}) => {
  renderState.containerControl.innerHTML = '';
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = enableRefineOnMapMove;
  checkbox.addEventListener('change', toggleRefineOnMapMove);
  label.appendChild(checkbox);
  label.append('Search as I move the map');
  renderState.containerControl.appendChild(label);
};

const renderRedoSearchButton = ({
  renderState,
  paddingBoundingBox,
  hasMapMoveSinceLastRefine,
  refine,
}) => {
  renderState.containerControl.innerHTML = '';
  const button = document.createElement('button');
  button.textContent = 'Redo search here';
  button.disabled = !hasMapMoveSinceLastRefine;
  button.addEventListener('click', () =>
    refineWithMap({
      refine,
      paddingBoundingBox,
      map: renderState.map,
    })
  );
  renderState.containerControl.appendChild(button);
};

const renderer = (
  {
    items,
    refine,
    clearMapRefinement,
    toggleRefineOnMapMove,
    setMapMoveSinceLastRefine,
    isRefinedWithMap,
    enableRefineOnMapMove,
    hasMapMoveSinceLastRefine,
    widgetParams,
  },
  isFirstRendering
) => {
  const {
    container,
    cssClasses,
    enableRefineControl,
    paddingBoundingBox,
    renderState,
  } = widgetParams;

  console.group('Render');
  console.log('isRefinedWithMap', isRefinedWithMap);
  console.log('enableRefineOnMapMove', enableRefineOnMapMove);
  console.log('hasMapMoveSinceLastRefine', hasMapMoveSinceLastRefine);
  console.groupEnd();

  if (isFirstRendering) {
    // Inital component state
    renderState.isUserInteraction = true;

    const node = getContainerNode(container);

    // Setup DOM element
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.css';
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

    const containerClear = document.createElement('div');
    containerClear.className = 'ais-control';
    containerButtonElement.appendChild(containerClear);
    renderState.containerClear = containerClear;

    const containerControl = document.createElement('div');
    containerControl.className = 'ais-control';
    containerButtonElement.appendChild(containerControl);
    renderState.containerControl = containerControl;

    renderState.map = L.map(rootElement);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(renderState.map);
  }

  // Events apply on each render in order
  // to update the scope each time
  renderState.map.off('dragstart', renderState.dragstart);
  renderState.map.off('move', renderState.move);
  renderState.map.off('moveend', renderState.moveend);

  renderState.dragstart = () => {
    if (enableRefineControl && !enableRefineOnMapMove) {
      renderRedoSearchButton({
        renderState,
        paddingBoundingBox,
        hasMapMoveSinceLastRefine,
        refine,
      });
    }
  };

  renderState.move = () => {
    if (renderState.isUserInteraction) {
      setMapMoveSinceLastRefine();
    }
  };

  renderState.moveend = () => {
    if (renderState.isUserInteraction && enableRefineOnMapMove) {
      refineWithMap({
        refine,
        paddingBoundingBox,
        map: renderState.map,
      });
    }
  };

  renderState.map.on('dragstart', renderState.dragstart);
  renderState.map.on('move', renderState.move);
  renderState.map.on('moveend', renderState.moveend);

  // Markers
  removeMarkers(renderState.markers);
  renderState.markers = addMarkers(renderState.map, items);

  const hasMarkers = renderState.markers.length;
  const enableFitBounds = !hasMapMoveSinceLastRefine && !isRefinedWithMap;

  if (hasMarkers && enableFitBounds) {
    fitMarkersBounds(renderState);
  }

  // UI
  renderClearRefinementButton({
    renderState,
    clearMapRefinement,
    isRefinedWithMap,
  });

  if (enableRefineControl) {
    renderControlElement({
      renderState,
      toggleRefineOnMapMove,
      enableRefineOnMapMove,
    });
  }

  if (
    !enableRefineOnMapMove &&
    (!enableRefineControl || (enableRefineControl && hasMapMoveSinceLastRefine))
  ) {
    renderRedoSearchButton({
      renderState,
      paddingBoundingBox,
      hasMapMoveSinceLastRefine,
      refine,
    });
  }
};

export default renderer;
