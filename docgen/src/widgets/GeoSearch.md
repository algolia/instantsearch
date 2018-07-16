---
mainTitle: Widgets
title: GeoSearch
layout: widget.pug
category: widget
showInNav: true
navWeight: 0
external: true
---

## Description

The `GeoSearch` widget displays the list of results from the search on a Google Maps. It also provides a way to search for results based on their position. The widget provides some of the common GeoSearch patterns like search on map interaction.

<div class="storybook-section">
  <a class="btn btn-cta" href="https://community.algolia.com/react-instantsearch/storybook?selectedKind=GeoSearch&selectedStory=default" target="_blank">
    See live example
  </a>
</div>

## Requirements

The API of this widget is a bit different than the others that you can find in React InstantSearch. The API is component driven rather than options driven. We chose the former because it brings more flexibility to the widget. Since the geo search pattern is not a use case for every applications we decided to ship the widget in a separate package. Be sure to install it before using it:

```shell
yarn add react-instantsearch-dom-maps
```

The GeoSearch widget uses the [geo search](https://www.algolia.com/doc/guides/searching/geo-search) capabilities of Algolia. Your hits **must** have a `_geoloc` attribute in order to be available in the render prop.

Currently, the feature is not compatible with multiple values in the `_geoloc` attribute (e.g. a restaurant with multiple locations). In that case you can duplicate your records and use the [distinct](https://www.algolia.com/doc/guides/ranking/distinct) feature of Algolia to only retrieve unique results.

You are also responsible for loading the Google Maps library. We provide a component to load the library ([`<GoogleMapsLoader />`](/widgets/GeoSearch.html#googlemapsloader)) but its usage **is not required to use the geo widget**. You can use any strategy you want to load Google Maps. You can find more informations about that in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/tutorial).

Don’t forget to explicitly set the `height` of the map container, otherwise it won’t be shown (it’s a requirement of Google Maps).

## Example

```jsx
import { InstantSearch } from 'react-instantsearch-dom';
import { GoogleMapsLoader, GeoSearch, Control, Marker } from 'react-instantsearch-dom-maps';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
    <div style={{ height: 500 }}>
      <GoogleMapsLoader apiKey="GOOGLE_MAPS_API_KEY">
        {google => (
          <GeoSearch google={google}>
            {({ hits }) => (
              <div>
                <Control />

                {hits.map(hit => (
                  <Marker key={hit.objectID} hit={hit} />
                ))}
              </div>
            )}
          </GeoSearch>
        )}
      </GoogleMapsLoader>
    </div>
  </InstantSearch>
);
```

## `<GeoSearch />`

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Decription</h3>

This component provides the `hits` to display. All the other geo components need to be nested under it. All the options avaible on the Google Maps class can be provided as props.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Usage</h3>

```jsx
import { InstantSearch } from 'react-instantsearch-dom';
import { GeoSearch } from 'react-instantsearch-dom-maps';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
    <GeoSearch google={window.google}>
      {({ hits }) => (
        // render the hits
      )}
    </GeoSearch>
  </InstantSearch>
);
```

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Props</h3>

<table class="api">
  <tbody>
    <tr>
      <td>google*</td>
      <td>Type: <code>object</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Reference to the global window.google object. See <a href="https://developers.google.com/maps/documentation/javascript/tutorial" target="_blank" rel="noopener">the documentation</a> for more information.</p>
      </td>
    </tr>
    <tr>
      <td>children*</td>
      <td>Type: <code>({ hits: object[] }) => React.ReactNode</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>
          The render function takes an object as argument with the <code>hits</code> inside.
        </p>
      </td>
    </tr>
    <tr>
      <td>initialZoom</td>
      <td>Type: <code>number</code></td>
      <td>Default: <code>1</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>By default the map will set the zoom accordingly to the markers displayed on it. When we refine it may happen that the results are empty. For those situations we need to provide a zoom to render the map.</p>
      </td>
    </tr>
    <tr>
      <td>initialPosition</td>
      <td>Type: <code>{ lat: number, lng: number }</code></td>
      <td>Default: <code>{ lat: 0, lng: 0 }</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>By default the map will set the position accordingly to the markers displayed on it. When we refine it may happen that the results are empty. For those situations we need to provide a position to render the map.</p>
      </td>
    </tr>
    <tr>
      <td>enableRefine</td>
      <td>Type: <code>boolean</code></td>
      <td>Default: <code>true</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>If false, this map is for display purposes only, not for refining the search</p>
      </td>
    </tr>
    <tr>
      <td>enableRefineOnMapMove</td>
      <td>Type: <code>boolean</code></td>
      <td>Default: <code>true</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>If true, refine will be triggered as you move the map.</p>
      </td>
    </tr>
  </tbody>
</table>

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">CSS classes</h3>

This component has no CSS classes.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Translation keys</h3>

This component has no translations.

## `<Marker />`

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Decription</h3>

This component is a wapper around [`google.maps.Marker`](https://developers.google.com/maps/documentation/javascript/reference/3.exp/marker#MarkerOptions), all the options avaible on the Marker class can be provided as props. This component cannot render any children components. See [`<CustomMarker />`](/widgets/GeoSearch.html#custommarker) for this behaviour.

Currently the component does not support the update of the options. Once the component is rendered changing the props won't update the marker options.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Usage</h3>

```jsx
import { InstantSearch } from 'react-instantsearch-dom';
import { GeoSearch, Marker } from 'react-instantsearch-dom-maps';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
    <GeoSearch google={window.google}>
      {({ hits }) => (
        <div>
          {hits.map(hit => (
            <Marker key={hit.objectID} hit={hit} />
          ))}
        </div>
      )}
    </GeoSearch>
  </InstantSearch>
);
```

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Props</h3>

<table class="api">
  <tbody>
    <tr>
      <td>hit*</td>
      <td>Type: <code>object</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Hit to attach on the marker.</p>
      </td>
    </tr>
    <tr>
      <td>onClick</td>
      <td>Type: <code>function</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>This event is fired when the marker icon was clicked, see <a href="https://developers.google.com/maps/documentation/javascript/reference/3.exp/marker#Marker.click" target="_blank" rel="noopener">the documentation</a> for more information.</p>
      </td>
    </tr>
    <tr>
      <td>onDoubleClick</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>This event is fired when the marker icon was double clicked, <a href="https://developers.google.com/maps/documentation/javascript/reference/3.exp/marker#Marker.dblclick" target="_blank" rel="noopener">the documentation</a> for more information.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseDown</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>This event is fired for a mousedown on the marker, <a href="https://developers.google.com/maps/documentation/javascript/reference/3.exp/marker#Marker.mousedown" target="_blank" rel="noopener">the documentation</a> for more information.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseOut</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>This event is fired when the mouse leaves the area of the marker icon, <a href="https://developers.google.com/maps/documentation/javascript/reference/3.exp/marker#Marker.mouseout" target="_blank" rel="noopener">the documentation</a> for more information.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseOver</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>This event is fired when the mouse enters the area of the marker icon, <a href="https://developers.google.com/maps/documentation/javascript/reference/3.exp/marker#Marker.mouseover" target="_blank" rel="noopener">the documentation</a> for more information.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseUp</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>This event is fired for a mouseup on the marker, <a href="https://developers.google.com/maps/documentation/javascript/reference/3.exp/marker#Marker.mouseup" target="_blank" rel="noopener">the documentation</a> for more information.</p>
      </td>
    </tr>
  </tbody>
</table>

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">CSS classes</h3>

This component has no CSS classes.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Translation keys</h3>

This component has no translations.

## `<CustomMarker />`

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Decription</h3>

This component is an alternative to [`<Marker />`](/widgets/GeoSearch.html#marker). In some cases you may want to have the full control of the marker rendering. You can provide any React components to design your custom marker.

Currently the component does not support the update of the options. Once the component is rendered changing the props won't update the marker options.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Usage</h3>

```jsx
import { InstantSearch } from 'react-instantsearch-dom';
import { GeoSearch, CustomMarker } from 'react-instantsearch-dom-maps';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
    <GeoSearch google={window.google}>
      {({ hits }) => (
        <div>
          {hits.map(hit => (
            <CustomMarker key={hit.objectID} hit={hit}>
              <span>{hit.price}</span>
            </CustomMarker>
          ))}
        </div>
      )}
    </GeoSearch>
  </InstantSearch>
);
```

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Props</h3>

<table class="api">
  <tbody>
    <tr>
      <td>hit*</td>
      <td>Type: <code>object</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Hit to attach on the marker.</p>
      </td>
    </tr>
    <tr>
      <td>className</td>
      <td>Type: <code>string</code></td>
      <td><code>''</<code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>The className to add on the marker wrapper element.</p>
      </td>
    </tr>
    <tr>
      <td>anchor</td>
      <td>Type: <code>{ x: number, y: number }</code></td>
      <td><code>{ x: 0, y: 0 }</<code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Offset for the marker element.</p>
      </td>
    </tr>
    <tr>
      <td>onClick</td>
      <td>Type: <code>function</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onDoubleClick</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseDown</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseEnter</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseLeave</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseMove</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseOut</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseOver</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
    <tr>
      <td>onMouseUp</td>
      <td>Type: <code>function</code></td>
      <td>-</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>Standard DOM event.</p>
      </td>
    </tr>
  </tbody>
</table>

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">CSS classes</h3>

This component has no CSS classes.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Translation keys</h3>

This component has no translations.

## `<Control />`

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Decription</h3>

This component allows the user to control the different strategy for the refinement (enable / disable refine on map move).

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Usage</h3>

```jsx
import { InstantSearch } from 'react-instantsearch-dom';
import { GeoSearch, Control } from 'react-instantsearch-dom-maps';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
    <GeoSearch google={window.google}>
      {({ hits }) => (
        <Control />
      )}
    </GeoSearch>
  </InstantSearch>
);
```

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Props</h3>

The component has no props.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">CSS classes</h3>

<table class="api">
  <tbody>
    <tr>
      <td>.ais-GeoSearch-control {}</td>
    </tr>
    <tr>
      <td>
        <p>The control element of the widget.</p>
      </td>
    </tr>
    <tr>
      <td>.ais-GeoSearch-label {}</td>
    </tr>
    <tr>
      <td>
        <p>The label of the control element.</p>
      </td>
    </tr>
    <tr>
      <td>.ais-GeoSearch-input {}</td>
    </tr>
    <tr>
      <td>
        <p>The input of the control element.</p>
      </td>
    </tr>
    <tr>
      <td>.ais-GeoSearch-redo {}</td>
    </tr>
    <tr>
      <td>
        <p>The redo search button.</p>
      </td>
    </tr>
  </tbody>
</table>

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Translation keys</h3>

<table class="api">
  <tbody>
    <tr>
      <td>control</td>
    </tr>
    <tr>
      <td>
        <p>The label of the radio button.</p>
      </td>
    </tr>
    <tr>
      <td>redo</td>
    </tr>
    <tr>
      <td>
        <p>The label of the redo button.</p>
      </td>
    </tr>
  </tbody>
</table>

## `<Redo />`

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Decription</h3>

When refined on map move is disabled this component displays a button to redo the search on the current map view.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Usage</h3>

```jsx
import { InstantSearch } from 'react-instantsearch-dom';
import { GeoSearch, Redo } from 'react-instantsearch-dom-maps';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
    <GeoSearch google={window.google} enableRefineOnMapMove={false}>
      {({ hits }) => (
        <Redo />
      )}
    </GeoSearch>
  </InstantSearch>
);
```

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Props</h3>

The component has no props.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">CSS classes</h3>

<table class="api">
  <tbody>
    <tr>
      <td>.ais-GeoSearch-control {}</td>
    </tr>
    <tr>
      <td>
        <p>The control element of the widget.</p>
      </td>
    </tr>
    <tr>
      <td>.ais-GeoSearch-redo {}</td>
    </tr>
    <tr>
      <td>
        <p>The redo search button.</p>
      </td>
    </tr>
    <tr>
      <td>.ais-GeoSearch-redo--disabled {}</td>
    </tr>
    <tr>
      <td>
        <p>The disabled redo search button.</p>
      </td>
    </tr>
  </tbody>
</table>

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Translation keys</h3>

<table class="api">
  <tbody>
    <tr>
      <td>redo</td>
    </tr>
    <tr>
      <td>
        <p>The label of the redo button.</p>
      </td>
    </tr>
  </tbody>
</table>

## `<GoogleMapsLoader />`

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Decription</h3>

This component provide a built-in solution to load the `google.maps` library in your application. Its usage is completely optional. You can use any strategy you want to load the library. You can find more informations about that in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/tutorial).

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Usage</h3>

```jsx
import { InstantSearch } from 'react-instantsearch-dom';
import { GoogleMapsLoader, GeoSearch } from 'react-instantsearch-dom-maps';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
    <GoogleMapsLoader apiKey="GOOGLE_MAPS_API_KEY">
      {google => (
        <GeoSearch google={google}>
          {({ hits }) => (
            <Redo />
          )}
        </GeoSearch>
      )}
    </GoogleMapsLoader>
  </InstantSearch>
);
```

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Props</h3>

<table class="api">
  <tbody>
    <tr>
      <td>apiKey*</td>
      <td>Type: <code>string</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>
          Your Google API Key in case you don't have one you can create it on <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener">the Google documentation</a>.
        </p>
      </td>
    </tr>
    <tr>
      <td>children*</td>
      <td>Type: <code>(google: object) => React.ReactNode</code></td>
      <td>-</td>
    </tr>
    <tr>
      <td colspan="3">
        <p>
          The render function that takes the <code>google</code> object as argument.
        </p>
      </td>
    </tr>
    <tr>
      <td>endpoint</td>
      <td>Type: <code>string</code></td>
      <td>Default: <code>https://maps.googleapis.com/maps/api/js?v=3.31</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <p>
          Endpoint that will be used to fetch the Google Maps library, can be used to load a different version, libraries, ... You can find more inforamtion <a href="https://developers.google.com/maps/documentation/javascript/libraries" target="_blank" rel="noopener">in the Google documentation</a>.
        </p>
      </td>
    </tr>
  </tbody>
</table>

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">CSS classes</h3>

The component has no CSS classes.

<!-- Avoid the huge margin on the pseudo element -->
<h3 class="sub-component-title">Translation keys</h3>

The component has no translations keys.
