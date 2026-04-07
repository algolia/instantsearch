import { useRef, useEffect, useState } from "preact/hooks";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { geoSearch } from "instantsearch.js/es/widgets";
import { useSearch } from "../../context/search";
import { type ColorMode, useColorMode } from "../../hooks/useColorMode";

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ";

type GoogleRef = (typeof window)["google"];

const COLOR_SCHEME_MAP: Record<ColorMode, "FOLLOW_SYSTEM" | "LIGHT" | "DARK"> = {
  system: "FOLLOW_SYSTEM",
  light: "LIGHT",
  dark: "DARK",
};

let googleMapsPromise: Promise<GoogleRef> | null = null;

function loadGoogleMaps() {
  if (!googleMapsPromise) {
    googleMapsPromise = (async () => {
      setOptions({ key: GOOGLE_MAPS_API_KEY, v: "weekly" });
      await importLibrary("maps");
      await importLibrary("marker");
      return window.google as GoogleRef;
    })().catch((err) => {
      googleMapsPromise = null;
      throw err;
    });
  }

  return googleMapsPromise;
}

export function WidgetGeoSearch() {
  const container = useRef<HTMLDivElement>(null);
  const search = useSearch();
  const { mode } = useColorMode();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let widget: ReturnType<typeof geoSearch> | null = null;

    loadGoogleMaps()
      .then((googleRef) => {
        if (!mounted) return;

        container.current!.replaceChildren();
        widget = geoSearch({
          container: container.current!,
          googleReference: googleRef,
          initialZoom: 4,
          initialPosition: { lat: 0, lng: 0 },
          cssClasses: { map: "!h-[500px] rounded-lg overflow-hidden shadow-sm" },
          mapOptions: {
            streetViewControl: false,
            mapTypeControl: false,
            colorScheme: window.google.maps.ColorScheme[COLOR_SCHEME_MAP[mode]],
            minZoom: 3,
            maxZoom: 7,
          },
        });
        search.addWidgets([widget]);
      })
      .catch(() => {
        if (mounted) setError("Failed to load Google Maps.");
      });

    return () => {
      mounted = false;
      if (widget) search.removeWidgets([widget]);
    };
  }, [mode]);

  if (error) {
    return (
      <div class="flex h-[500px] items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
        {error}
      </div>
    );
  }

  return <div ref={container} />;
}
