const createHTMLMarker = google => {
  class HTMLMarker extends google.maps.OverlayView {
    constructor({
      position,
      map,
      className,
      anchor = {
        x: 0,
        y: 0,
      },
    }) {
      super();

      this.anchor = anchor;
      this.subscriptions = [];
      this.latLng = new google.maps.LatLng(position);

      this.element = document.createElement('div');
      this.element.className = className;
      this.element.style.position = 'absolute';
      // Force the "white-space" of the element will avoid the
      // content to collapse when we move the map from center
      this.element.style.whiteSpace = 'nowrap';

      this.setMap(map);
    }

    onAdd() {
      if (this.getPanes()) {
        this.getPanes().overlayMouseTarget.appendChild(this.element);
      }
    }

    draw() {
      if (this.getProjection()) {
        const position = this.getProjection().fromLatLngToDivPixel(this.latLng);

        const offsetX = this.anchor.x + this.element.offsetWidth / 2;
        const offsetY = this.anchor.y + this.element.offsetHeight;

        this.element.style.left = `${Math.round(position.x - offsetX)}px`;
        this.element.style.top = `${Math.round(position.y - offsetY)}px`;

        // Markers to the south are in front of markers to the north
        // This is the default behaviour of Google Maps
        this.element.style.zIndex = parseInt(this.element.style.top, 10);
      }
    }

    onRemove() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);

        this.subscriptions.forEach(subscription => subscription.remove());

        delete this.element;

        this.subscriptions = [];
      }
    }

    addListener(eventName, listener) {
      const subscription = {
        remove: () => {
          this.element.removeEventListener(eventName, listener);

          this.subscriptions = this.subscriptions.filter(
            _ => _ !== subscription
          );
        },
      };

      this.element.addEventListener(eventName, listener);

      this.subscriptions = this.subscriptions.concat(subscription);

      return subscription;
    }

    getPosition() {
      return this.latLng;
    }
  }

  return HTMLMarker;
};

export default createHTMLMarker;
