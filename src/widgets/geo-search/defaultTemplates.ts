import type { GeoSearchComponentTemplates } from './geo-search.js';

const defaultTemplates: GeoSearchComponentTemplates = {
  HTMLMarker: '<p>Your custom HTML Marker</p>',
  reset: 'Clear the map refinement',
  toggle: 'Search as I move the map',
  redo: 'Redo search here',
};

export default defaultTemplates;
