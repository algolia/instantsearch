/* eslint-disable @typescript-eslint/no-empty-interface */
import type { JSX as ReactJSX } from 'react';

declare global {
  const __DEV__: boolean;

  namespace JSX {
    interface Element extends ReactJSX.Element {}
    interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
  }
}
