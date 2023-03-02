/** @jsx h */

import { h } from 'preact';

import type { GeoSearchComponentTemplates } from './geo-search';

const defaultTemplates: GeoSearchComponentTemplates = {
  HTMLMarker() {
    return <p>Your custom HTML Marker</p>;
  },
  reset() {
    return 'Clear the map refinement';
  },
  toggle() {
    return 'Search as I move the map';
  },
  redo() {
    return 'Redo search here';
  },
};

export default defaultTemplates;
