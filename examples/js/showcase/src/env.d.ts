/// <reference types="vite/client" />

interface Window {
  google?: typeof google;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}
