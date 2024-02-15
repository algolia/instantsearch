/* global google EventListener */
import { render } from 'preact';

import type { renderTemplate } from '../../lib/templating';

export type HTMLMarkerArguments = {
  __id: string;
  position: google.maps.LatLngLiteral;
  map: google.maps.Map;
  template: ReturnType<typeof renderTemplate>;
  title?: string;
  className: string;
  anchor?: { x: number; y: number };
};

interface Marker {
  __id: string;
  anchor: { x: number; y: number };
  offset?: { x: number; y: number };
  listeners: { [key: string]: EventListener };
  latLng: google.maps.LatLng;
  element: HTMLDivElement;
  getPosition: () => google.maps.LatLng;
}

const createHTMLMarker = (
  googleReference: typeof google
): new (args: HTMLMarkerArguments) => google.maps.OverlayView & Marker => {
  class HTMLMarker extends googleReference.maps.OverlayView {
    public __id: string;
    public anchor: {
      x: number;
      y: number;
    };
    public offset?: {
      x: number;
      y: number;
    };
    public listeners: { [key: string]: EventListener };
    public latLng: google.maps.LatLng;
    public element: HTMLDivElement;

    public constructor({
      __id,
      position,
      map,
      template,
      className,
      anchor = {
        x: 0,
        y: 0,
      },
    }: HTMLMarkerArguments) {
      super();

      this.__id = __id;
      this.anchor = anchor;
      this.listeners = {};
      this.latLng = new googleReference.maps.LatLng(position);

      this.element = document.createElement('div');
      this.element.className = className;
      this.element.style.position = 'absolute';

      if (typeof template === 'object') {
        render(template, this.element);
      } else {
        this.element.innerHTML = template;
      }

      this.setMap(map);
    }

    public onAdd() {
      // Append the element to the map
      this.getPanes()!.overlayMouseTarget.appendChild(this.element);

      // Compute the offset onAdd & cache it because afterwards
      // it won't retrieve the correct values, we also avoid
      // to read the values on every draw
      const bbBox = this.element.getBoundingClientRect();

      this.offset = {
        x: this.anchor.x + bbBox.width / 2,
        y: this.anchor.y + bbBox.height,
      };

      // Force the width of the element will avoid the
      // content to collapse when we move the map
      this.element.style.width = `${bbBox.width}px`;
    }

    public draw() {
      const position = this.getProjection().fromLatLngToDivPixel(this.latLng)!;

      this.element.style.left = `${Math.round(position.x - this.offset!.x)}px`;
      this.element.style.top = `${Math.round(position.y - this.offset!.y)}px`;

      // Markers to the south are in front of markers to the north
      // This is the default behaviour of Google Maps
      this.element.style.zIndex = String(parseInt(this.element.style.top, 10));
    }

    public onRemove() {
      if (this.element) {
        this.element.parentNode!.removeChild(this.element);

        Object.keys(this.listeners).forEach((eventName) => {
          this.element.removeEventListener(
            eventName,
            this.listeners[eventName]
          );
        });

        // after onRemove the class is no longer used, thus it can be deleted
        // @ts-expect-error
        delete this.element;
        // @ts-expect-error
        delete this.listeners;
      }
    }

    public addListener(eventName: string, listener: EventListener) {
      this.listeners[eventName] = listener;

      const element = this.element;

      element.addEventListener(eventName, listener);

      return {
        remove() {
          return element.removeEventListener(eventName, listener);
        },
      };
    }

    public getPosition() {
      return this.latLng;
    }
  }

  return HTMLMarker;
};

export default createHTMLMarker;
