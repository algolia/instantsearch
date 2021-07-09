declare class InfoBox {
  div_: HTMLDivElement;
  setOptions({ pixelOffset: any });
  open(map: google.maps.Map, marker: google.maps.Marker): void;
  close(): void;
  getMap(): google.maps.Map;
  setContent(html: string): void;
  addListener(event: string, cb: () => void);
}

declare const createInfoBox: (
  googleReference: typeof google
) => new () => InfoBox;

export default createInfoBox;
