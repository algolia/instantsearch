import { useEffect, useState } from 'react';
import { Pane } from 'tweakpane';

import { Layout } from '../src';
import { Shape } from '../src/lib/types';
import { ATTRIBUTE, SEPARATOR } from '../config/algolia';

const defaultProps = {
  attribute: ATTRIBUTE,
  sortByColor: true,
  limit: 6,
  layout: Layout.Grid,
  shape: Shape.Circle,
  pinRefined: false,
  showMore: false,
  showMoreLimit: 20,
  separator: SEPARATOR,
};

export const useDebugger = () => {
  const [props, setProps] = useState(defaultProps);

  useEffect(() => {
    const pane = new Pane({
      title: 'ColorRefinementList widget',
      expanded: true,
      container: document.getElementById('debug') as HTMLElement,
    });

    const propsFolder = pane.addFolder({ title: 'Props' });

    const commonFolder = propsFolder.addFolder({ title: 'Common' });
    commonFolder.addInput(defaultProps, 'sortByColor');
    commonFolder.addInput(defaultProps, 'limit', {
      min: 1,
      max: 12,
      step: 1,
    });
    commonFolder.addInput(defaultProps, 'separator');

    const uiFolder = propsFolder.addFolder({ title: 'UI' });
    uiFolder.addInput(defaultProps, 'layout', {
      options: {
        Grid: 'Grid',
        List: 'List',
      },
    });
    uiFolder.addInput(defaultProps, 'shape', {
      options: {
        Circle: 'Circle',
        Square: 'Square',
      },
    });
    uiFolder.addInput(defaultProps, 'pinRefined');

    const showMoreFolder = propsFolder.addFolder({ title: 'Show More' });
    showMoreFolder.addInput(defaultProps, 'showMore');
    showMoreFolder.addInput(defaultProps, 'showMoreLimit', {
      min: 1,
      max: 20,
      step: 1,
    });

    pane.on('change', (ev) => {
      setProps((p) => ({
        ...p,
        [ev.presetKey as string]: ev.value,
      }));
    });

    return () => {
      pane.dispose();
    };
  }, [setProps]);

  return {
    props,
  };
};

export const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1);
