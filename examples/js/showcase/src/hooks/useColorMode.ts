import { useSyncExternalStore } from "preact/compat";

export type ColorMode = "system" | "light" | "dark";

const STORAGE_KEY = "color-mode";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ColorMode) {
  const resolved = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.setAttribute("data-theme", resolved);
}

let currentMode: ColorMode = (localStorage.getItem(STORAGE_KEY) as ColorMode) || "system";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentMode;
}

function setMode(next: ColorMode) {
  currentMode = next;
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  listeners.forEach((fn) => fn());
}

applyTheme(currentMode);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (currentMode === "system") applyTheme("system");
});

export function useColorMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot);
  return { mode, setMode };
}
