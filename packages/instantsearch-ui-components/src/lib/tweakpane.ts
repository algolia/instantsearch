// @ts-expect-error - importing JSON file
import variablesConfig from './variables-config.json';

import type { Pane } from 'tweakpane';

type Theme = 'auto' | 'light' | 'dark';

export interface TweakpaneOptions {
  /**
   * The container element to append the pane to.
   * If not provided, a new div will be created and appended to document.body.
   */
  container?: HTMLElement;
  /**
   * Custom styles to apply to the container element.
   * Use this to customize positioning and other visual properties.
   * Default: { position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: '1000' }
   */
  style?: Partial<CSSStyleDeclaration>;
}

interface VariableConfig {
  name: string;
  type: string;
  themeVariable: boolean;
  category: string;
  control: {
    label: string;
    colorName?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    convertFromRem?: boolean;
  };
}

interface CSSValues {
  theme: Theme;
  [key: string]: string | number;
}

// Utility functions
function getCSSVariableValue(property: string, fallback: string = '') {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim() || fallback
  );
}

function rgbToHex(rgb: string) {
  const values = rgb.split(',').map((v) => parseInt(v.trim(), 10));
  if (values.length !== 3) return '#000000';

  const [r, g, b] = values;
  return `#${[r, g, b]
    .map((x) => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('')}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function parseNumericValue(cssValue: string) {
  const match = cssValue.match(/^(\d*\.?\d+)/);
  return match ? parseFloat(match[1]) : 0;
}

function getCurrentTheme(): Theme {
  const theme = document.documentElement.getAttribute('data-theme');
  return (theme as Theme) || 'auto';
}

function applyTheme(theme: Theme) {
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function updateCSSVariable(property: string, value: string | number) {
  document.documentElement.style.setProperty(property, String(value));
}

function updateColorVariable(
  colorHex: string,
  rgbProperty: string,
  alphaProperty?: string,
  alpha?: number
) {
  const { r, g, b } = hexToRgb(colorHex);
  updateCSSVariable(rgbProperty, `${r}, ${g}, ${b}`);
  if (alphaProperty && alpha !== undefined) {
    updateCSSVariable(alphaProperty, alpha);
  }
}

/**
 * Get default values from CSS variables based on config
 */
function getDefaultValues(config: typeof variablesConfig): CSSValues {
  const values: CSSValues = {
    theme: getCurrentTheme(),
  };

  config.variables.forEach((variable: VariableConfig) => {
    const cssValue = getCSSVariableValue(variable.name);

    if (variable.type === 'color-rgb') {
      // Convert RGB to hex color
      values[variable.control.colorName!] = rgbToHex(cssValue);
    } else if (variable.type === 'color-alpha') {
      // Store alpha as number
      const alphaKey = variable.control.label.replace(/ /g, '');
      values[alphaKey] = parseFloat(cssValue) || 1;
    } else if (variable.type === 'spacing' && variable.control.convertFromRem) {
      // Convert rem to px (multiply by 16)
      values[variable.control.label.replace(/ /g, '')] =
        parseNumericValue(cssValue) * 16;
    } else {
      // Store raw numeric value
      values[variable.control.label.replace(/ /g, '')] =
        parseNumericValue(cssValue);
    }
  });

  return values;
}

/**
 * Group variables by category
 */
function groupByCategory(
  variables: VariableConfig[]
): Record<string, VariableConfig[]> {
  return variables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, VariableConfig[]>);
}

/**
 * Pair color-rgb variables with their corresponding alpha variables
 */
function getColorPairs(variables: VariableConfig[]): Array<{
  rgb: VariableConfig;
  alpha?: VariableConfig;
}> {
  const rgbVars = variables.filter((v) => v.type === 'color-rgb');
  const alphaVars = variables.filter((v) => v.type === 'color-alpha');

  return rgbVars.map((rgb) => {
    const alphaName = rgb.name.replace('-rgb', '-alpha');
    const alpha = alphaVars.find((a) => a.name === alphaName);
    return { rgb, alpha };
  });
}

/**
 * Get non-color variables
 */
function getNonColorVariables(variables: VariableConfig[]): VariableConfig[] {
  return variables.filter(
    (v) => v.type !== 'color-rgb' && v.type !== 'color-alpha'
  );
}

/**
 * Export current CSS variables
 */
function exportCSSVariables(
  values: CSSValues,
  config: typeof variablesConfig
): string {
  let output = `// CSS Variables\n:root {\n`;

  config.variables.forEach((variable: VariableConfig) => {
    if (variable.type === 'color-rgb') {
      const hex = values[variable.control.colorName!] as string;
      const { r, g, b } = hexToRgb(hex);
      output += `  ${variable.name}: ${r}, ${g}, ${b};\n`;
    } else if (variable.type === 'color-alpha') {
      const alphaKey = variable.control.label.replace(/ /g, '');
      output += `  ${variable.name}: ${values[alphaKey]};\n`;
    } else if (variable.type === 'spacing' && variable.control.convertFromRem) {
      const key = variable.control.label.replace(/ /g, '');
      output += `  ${variable.name}: ${(values[key] as number) / 16}rem;\n`;
    } else {
      const key = variable.control.label.replace(/ /g, '');
      output += `  ${variable.name}: ${values[key]}${
        variable.control.unit || ''
      };\n`;
    }
  });

  output += `}`;
  return output;
}

/**
 * Creates a Tweakpane panel to configure InstantSearch CSS variables in real-time.
 *
 * @param options - Configuration options for the pane
 * @returns A cleanup function that disposes the pane and removes the container
 *
 * @example
 * ```typescript
 * import { createInstantSearchTweakpane } from 'instantsearch-ui-components';
 *
 * // Create with default positioning
 * const cleanup = createInstantSearchTweakpane();
 *
 * // Create with custom positioning
 * const cleanup = createInstantSearchTweakpane({
 *   style: { top: '20px', right: '20px', zIndex: '10000' }
 * });
 *
 * // Later, when you want to remove the pane:
 * cleanup();
 * ```
 */
export function createInstantSearchTweakpane(
  options: TweakpaneOptions = {}
): () => void {
  let PaneConstructor: typeof Pane;
  try {
    PaneConstructor = require('tweakpane').Pane;
  } catch (error) {
    throw new Error(
      'Tweakpane is not installed. Please install it with: npm install tweakpane'
    );
  }

  // Create or use provided container
  let container = options.container;
  let shouldRemoveContainer = false;

  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
    shouldRemoveContainer = true;

    // Apply default styles
    const defaultStyle: Partial<CSSStyleDeclaration> = {
      position: 'fixed',
      bottom: '1.5rem',
      left: '1.5rem',
      zIndex: '1000',
      overflow: 'auto',
      maxHeight: 'calc(100% - 3rem)',
    };

    Object.assign(container.style, defaultStyle, options.style || {});
  } else if (options.style) {
    // Apply custom styles to provided container
    Object.assign(container.style, options.style);
  }

  // Create the pane
  const pane = new PaneConstructor({
    container,
    title: 'InstantSearch CSS Variables',
    expanded: false,
  });

  const values = getDefaultValues(variablesConfig);

  // Flag to prevent triggering events during theme updates
  let isUpdatingTheme = false;

  // Theme Control
  pane
    .addBinding(values, 'theme', {
      options: {
        Auto: 'auto',
        Light: 'light',
        Dark: 'dark',
      },
      label: 'Theme',
    })
    .on('change', (ev: any) => {
      applyTheme(ev.value);

      // Update the pane values to reflect the new theme without triggering events
      isUpdatingTheme = true;

      const newValues = getDefaultValues(variablesConfig);

      // Update all color values that change with theme
      variablesConfig.variables.forEach((variable: VariableConfig) => {
        if (variable.themeVariable && variable.type === 'color-rgb') {
          values[variable.control.colorName!] =
            newValues[variable.control.colorName!];
        }
      });

      // Refresh pane to show updated values
      pane.refresh();

      isUpdatingTheme = false;
    });

  // Group variables by category
  const categories = groupByCategory(variablesConfig.variables);

  Object.entries(categories).forEach(([categoryName, variables]) => {
    const folder = pane.addFolder({ title: categoryName });

    // Handle color variables (RGB + Alpha pairs)
    const colorPairs = getColorPairs(variables);
    colorPairs.forEach((pair) => {
      const { rgb, alpha } = pair;

      folder
        .addBinding(values, rgb.control.colorName!, {
          label: rgb.control.label,
        })
        .on('change', (ev: any) => {
          if (isUpdatingTheme) return;
          const alphaValue = alpha
            ? (values[alpha.control.label.replace(/ /g, '')] as number)
            : undefined;
          updateColorVariable(ev.value, rgb.name, alpha?.name, alphaValue);
        });

      // Add alpha slider if exists
      if (alpha) {
        const alphaKey = alpha.control.label.replace(/ /g, '');
        folder
          .addBinding(values, alphaKey, {
            min: alpha.control.min,
            max: alpha.control.max,
            step: alpha.control.step,
            label: alpha.control.label,
          })
          .on('change', (ev: any) => updateCSSVariable(alpha.name, ev.value));
      }
    });

    // Handle non-color variables
    const otherVariables = getNonColorVariables(variables);
    otherVariables.forEach((variable) => {
      const key = variable.control.label.replace(/ /g, '');

      folder
        .addBinding(values, key, {
          min: variable.control.min,
          max: variable.control.max,
          step: variable.control.step,
          label: variable.control.label,
        })
        .on('change', (ev: any) => {
          let cssValue: string;

          if (variable.type === 'spacing' && variable.control.convertFromRem) {
            // Convert px to rem
            cssValue = `${ev.value / 16}rem`;
          } else {
            // Use value with unit
            cssValue = `${ev.value}${variable.control.unit || ''}`;
          }

          updateCSSVariable(variable.name, cssValue);
        });
    });
  });

  const exportFolder = pane.addFolder({ title: 'Export' });

  exportFolder.addButton({ title: 'Copy to clipboard' }).on('click', () => {
    const cssVariables = exportCSSVariables(values, variablesConfig);
    navigator.clipboard
      .writeText(cssVariables)
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('CSS variables copied to clipboard!');
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to copy CSS variables:', err);
        // eslint-disable-next-line no-console
        console.log('CSS Variables:\n', cssVariables);
      });
  });

  return () => {
    pane.dispose();
    if (shouldRemoveContainer && container?.parentNode) {
      container.parentNode.removeChild(container);
    }
  };
}
