// @ts-check

const variablesConfig = {
  variables: [
    {
      name: '--ais-text-color-rgb',
      type: 'color-rgb',
      themeVariable: true,
      category: 'Text Colors',
      control: {
        label: 'Text Color Rgb',
        colorName: 'textColor',
      },
    },
    {
      name: '--ais-text-color-alpha',
      type: 'color-alpha',
      themeVariable: false,
      category: 'Text Colors',
      control: {
        label: 'Text Color Alpha',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      name: '--ais-primary-color-rgb',
      type: 'color-rgb',
      themeVariable: true,
      category: 'Text Colors',
      control: {
        label: 'Primary Color Rgb',
        colorName: 'primaryColor',
      },
    },
    {
      name: '--ais-primary-color-alpha',
      type: 'color-alpha',
      themeVariable: false,
      category: 'Text Colors',
      control: {
        label: 'Primary Color Alpha',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      name: '--ais-muted-color-rgb',
      type: 'color-rgb',
      themeVariable: true,
      category: 'Text Colors',
      control: {
        label: 'Muted Color Rgb',
        colorName: 'mutedColor',
      },
    },
    {
      name: '--ais-muted-color-alpha',
      type: 'color-alpha',
      themeVariable: false,
      category: 'Text Colors',
      control: {
        label: 'Muted Color Alpha',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      name: '--ais-button-text-color-rgb',
      type: 'color-rgb',
      themeVariable: true,
      category: 'Text Colors',
      control: {
        label: 'Button Text Color Rgb',
        colorName: 'buttonTextColor',
      },
    },
    {
      name: '--ais-button-text-color-alpha',
      type: 'color-alpha',
      themeVariable: false,
      category: 'Text Colors',
      control: {
        label: 'Button Text Color Alpha',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      name: '--ais-border-color-rgb',
      type: 'color-rgb',
      themeVariable: true,
      category: 'Border & Background',
      control: {
        label: 'Border Color Rgb',
        colorName: 'borderColor',
      },
    },
    {
      name: '--ais-border-color-alpha',
      type: 'color-alpha',
      themeVariable: false,
      category: 'Border & Background',
      control: {
        label: 'Border Color Alpha',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      name: '--ais-background-color-rgb',
      type: 'color-rgb',
      themeVariable: true,
      category: 'Border & Background',
      control: {
        label: 'Background Color Rgb',
        colorName: 'backgroundColor',
      },
    },
    {
      name: '--ais-background-color-alpha',
      type: 'color-alpha',
      themeVariable: false,
      category: 'Border & Background',
      control: {
        label: 'Background Color Alpha',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      name: '--ais-shadow-color-rgb',
      type: 'color-rgb',
      themeVariable: true,
      category: 'Border & Background',
      control: {
        label: 'Shadow Color Rgb',
        colorName: 'shadowColor',
      },
    },
    {
      name: '--ais-base-unit',
      type: 'unitless',
      themeVariable: false,
      category: 'Spacing & Layout',
      control: {
        label: 'Base Unit',
        min: 8,
        max: 32,
        step: 1,
        unit: 'unitless',
      },
    },
    {
      name: '--ais-spacing-factor',
      type: 'unitless',
      themeVariable: false,
      category: 'Spacing & Layout',
      control: {
        label: 'Spacing Factor',
        min: 0.5,
        max: 3,
        step: 0.1,
        unit: 'unitless',
      },
    },
    {
      name: '--ais-border-radius-sm',
      type: 'border-radius',
      themeVariable: false,
      category: 'Border Radius',
      control: {
        label: 'Border Radius Sm',
        min: 0,
        max: 20,
        step: 1,
        unit: 'px',
      },
    },
    {
      name: '--ais-border-radius-md',
      type: 'border-radius',
      themeVariable: false,
      category: 'Border Radius',
      control: {
        label: 'Border Radius Md',
        min: 0,
        max: 30,
        step: 1,
        unit: 'px',
      },
    },
    {
      name: '--ais-border-radius-lg',
      type: 'border-radius',
      themeVariable: false,
      category: 'Border Radius',
      control: {
        label: 'Border Radius Lg',
        min: 0,
        max: 50,
        step: 1,
        unit: 'px',
      },
    },
    {
      name: '--ais-border-radius-full',
      type: 'border-radius',
      themeVariable: false,
      category: 'Border Radius',
      control: {
        label: 'Border Radius Full',
        min: 0,
        max: 9999,
        step: 10,
        unit: 'px',
      },
    },
    {
      name: '--ais-font-weight-medium',
      type: 'unitless',
      themeVariable: false,
      category: 'Other',
      control: {
        label: 'Font Weight Medium',
        min: 0,
        max: 100,
        step: 1,
        unit: 'unitless',
      },
    },
    {
      name: '--ais-font-weight-semibold',
      type: 'unitless',
      themeVariable: false,
      category: 'Other',
      control: {
        label: 'Font Weight Semibold',
        min: 0,
        max: 100,
        step: 1,
        unit: 'unitless',
      },
    },
    {
      name: '--ais-font-weight-bold',
      type: 'unitless',
      themeVariable: false,
      category: 'Other',
      control: {
        label: 'Font Weight Bold',
        min: 0,
        max: 100,
        step: 1,
        unit: 'unitless',
      },
    },
    {
      name: '--ais-icon-size',
      type: 'dimension-px',
      themeVariable: false,
      category: 'Other',
      control: {
        label: 'Icon Size',
        min: 10,
        max: 100,
        step: 1,
        unit: 'px',
      },
    },
    {
      name: '--ais-icon-stroke-width',
      type: 'unitless',
      themeVariable: false,
      category: 'Other',
      control: {
        label: 'Icon Stroke Width',
        min: 0,
        max: 100,
        step: 1,
        unit: 'unitless',
      },
    },
    {
      name: '--ais-transition-duration',
      type: 'duration',
      themeVariable: false,
      category: 'Transitions',
      control: {
        label: 'Transition Duration',
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: 's',
      },
    },
    {
      name: '--ais-z-index-chat',
      type: 'z-index',
      themeVariable: false,
      category: 'Z-index',
      control: {
        label: 'Z Index Chat',
        min: 1,
        max: 10000,
        step: 1,
      },
    },
    {
      name: '--ais-z-index-autocomplete',
      type: 'z-index',
      themeVariable: false,
      category: 'Z-index',
      control: {
        label: 'Z Index Autocomplete',
        min: 1,
        max: 10000,
        step: 1,
      },
    },
    {
      name: '--ais-chat-width',
      type: 'dimension-rem',
      themeVariable: false,
      category: 'Chat Component',
      control: {
        label: 'Chat Width',
        min: 10,
        max: 50,
        step: 0.5,
        unit: 'rem',
      },
    },
    {
      name: '--ais-chat-height',
      type: 'dimension-percent',
      themeVariable: false,
      category: 'Chat Component',
      control: {
        label: 'Chat Height',
        min: 30,
        max: 100,
        step: 5,
        unit: '%',
      },
    },
    {
      name: '--ais-chat-maximized-width',
      type: 'dimension-percent',
      themeVariable: false,
      category: 'Chat Component',
      control: {
        label: 'Chat Maximized Width',
        min: 50,
        max: 100,
        step: 5,
        unit: '%',
      },
    },
    {
      name: '--ais-chat-maximized-height',
      type: 'dimension-percent',
      themeVariable: false,
      category: 'Chat Component',
      control: {
        label: 'Chat Maximized Height',
        min: 80,
        max: 100,
        step: 5,
        unit: '%',
      },
    },
    {
      name: '--ais-chat-margin',
      type: 'dimension-rem',
      themeVariable: false,
      category: 'Chat Component',
      control: {
        label: 'Chat Margin',
        min: 0,
        max: 5,
        step: 0.1,
        unit: 'rem',
      },
    },
    {
      name: '--ais-autocomplete-search-input-height',
      type: 'dimension-px',
      themeVariable: false,
      category: 'Other',
      control: {
        label: 'Autocomplete Search Input Height',
        min: 20,
        max: 500,
        step: 10,
        unit: 'px',
      },
    },
    {
      name: '--ais-autocomplete-panel-max-height',
      type: 'dimension-px',
      themeVariable: false,
      category: 'Other',
      control: {
        label: 'Autocomplete Panel Max Height',
        min: 20,
        max: 500,
        step: 10,
        unit: 'px',
      },
    },
  ],
};

/**
 * @typedef {'auto' | 'light' | 'dark'} Theme
 */

/**
 * @typedef {Object} DevtoolsOptions
 * @property {HTMLElement} [container] - The container element to append the devtools panel to.
 *   If not provided, a new div will be created and appended to document.body.
 * @property {Partial<CSSStyleDeclaration>} [style] - Custom styles to apply to the container element.
 *   Use this to customize positioning and other visual properties.
 *   Default: { position: 'fixed', bottom: '1.5rem', left: '1.5rem', zIndex: '1000' }
 */

/**
 * @typedef {Object} VariableConfig
 * @property {string} name
 * @property {string} type
 * @property {boolean} themeVariable
 * @property {string} category
 * @property {Object} control
 * @property {string} control.label
 * @property {string} [control.colorName]
 * @property {number} [control.min]
 * @property {number} [control.max]
 * @property {number} [control.step]
 * @property {string} [control.unit]
 * @property {boolean} [control.convertFromRem]
 */

/**
 * @typedef {Object} CSSValues
 * @property {Theme} theme
 * @property {string | number} [key]
 */

// Utility functions
function getCSSVariableValue(property, fallback = '') {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim() || fallback
  );
}

function rgbToHex(rgb) {
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

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function parseNumericValue(cssValue) {
  const match = cssValue.match(/^(\d*\.?\d+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Get the current theme setting
 * @returns {Theme} The current theme
 */
function getCurrentTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  return /** @type {Theme} */ (theme || 'auto');
}

/**
 * Apply a theme to the document
 * @param {Theme} theme - The theme to apply
 * @returns {void}
 */
function applyTheme(theme) {
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

function updateCSSVariable(property, value) {
  document.documentElement.style.setProperty(property, String(value));
}

function updateColorVariable(colorHex, rgbProperty, alphaProperty, alpha) {
  const { r, g, b } = hexToRgb(colorHex);
  updateCSSVariable(rgbProperty, `${r}, ${g}, ${b}`);
  if (alphaProperty && alpha !== undefined) {
    updateCSSVariable(alphaProperty, alpha);
  }
}

/**
 * Get default values from CSS variables based on config
 * @param {Object} config - The variables configuration object
 * @returns {CSSValues} Object containing theme and CSS variable values
 */
function getDefaultValues(config) {
  const values = {
    theme: getCurrentTheme(),
  };

  config.variables.forEach((variable) => {
    const cssValue = getCSSVariableValue(variable.name);

    if (variable.type === 'color-rgb') {
      // Convert RGB to hex color
      values[variable.control.colorName] = rgbToHex(cssValue);
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
 * @param {VariableConfig[]} variables - Array of variable configurations
 * @returns {Object} Object mapping category names to arrays of variables
 */
function groupByCategory(variables) {
  return variables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {});
}

/**
 * Pair color-rgb variables with their corresponding alpha variables
 * @param {VariableConfig[]} variables - Array of variable configurations
 * @returns {Array} Array of color pairs with rgb and optional alpha
 */
function getColorPairs(variables) {
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
 * @param {VariableConfig[]} variables - Array of variable configurations
 * @returns {VariableConfig[]} Array of non-color variables
 */
function getNonColorVariables(variables) {
  return variables.filter(
    (v) => v.type !== 'color-rgb' && v.type !== 'color-alpha'
  );
}

/**
 * Export current CSS variables as CSS text
 * @param {CSSValues} values - Current CSS variable values
 * @param {Object} config - The variables configuration object
 * @returns {string} CSS text with variable definitions
 */
function exportCSSVariables(values, config) {
  let output = `/* CSS Variables */\n:root {\n`;

  config.variables.forEach((variable) => {
    if (variable.type === 'color-rgb') {
      const hex = values[variable.control.colorName];
      const { r, g, b } = hexToRgb(hex);
      output += `  ${variable.name}: ${r}, ${g}, ${b};\n`;
    } else if (variable.type === 'color-alpha') {
      const alphaKey = variable.control.label.replace(/ /g, '');
      output += `  ${variable.name}: ${values[alphaKey]};\n`;
    } else if (variable.type === 'spacing' && variable.control.convertFromRem) {
      const key = variable.control.label.replace(/ /g, '');
      output += `  ${variable.name}: ${values[key] / 16}rem;\n`;
    } else {
      const key = variable.control.label.replace(/ /g, '');
      const unit =
        variable.control.unit === 'unitless' ? '' : variable.control.unit || '';
      output += `  ${variable.name}: ${values[key]}${unit};\n`;
    }
  });

  output += `}`;
  return output;
}

/**
 * Creates an InstantSearch.css DevTools panel to configure CSS variables in real-time.
 * @param {DevtoolsOptions} [options] - Configuration options for the devtools panel
 * @returns {Promise<Function>} A promise that resolves to a cleanup function that disposes the panel and removes the container
 */
export function createInstantSearchDevtools(options = {}) {
  return import('tweakpane')
    .then((tweakpane) => {
      const PaneConstructor = tweakpane.Pane;

      // Create or use provided container
      let container = options.container;
      let shouldRemoveContainer = false;

      if (!container) {
        container = document.createElement('div');
        document.body.appendChild(container);
        shouldRemoveContainer = true;

        // Apply default styles
        const defaultStyle = {
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
        title: 'InstantSearch.css DevTools',
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
        .on('change', (ev) => {
          applyTheme(ev.value);

          // Update the pane values to reflect the new theme without triggering events
          isUpdatingTheme = true;

          const newValues = getDefaultValues(variablesConfig);

          // Update all color values that change with theme
          variablesConfig.variables.forEach((variable) => {
            if (
              variable.themeVariable &&
              variable.type === 'color-rgb' &&
              variable.control.colorName
            ) {
              values[variable.control.colorName] =
                newValues[variable.control.colorName];
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
            .addBinding(values, rgb.control.colorName, {
              label: rgb.control.label,
            })
            .on('change', (ev) => {
              if (isUpdatingTheme) return;
              const alphaValue = alpha
                ? values[alpha.control.label.replace(/ /g, '')]
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
              .on('change', (ev) => updateCSSVariable(alpha.name, ev.value));
          }
        });

        // Handle non-color variables
        const otherVariables = getNonColorVariables(variables);
        otherVariables.forEach((variable) => {
          const key = variable.control.label.replace(/ /g, '');
          const shouldShowUnit =
            variable.control.unit && variable.control.unit !== 'unitless';
          const label = shouldShowUnit
            ? `${variable.control.label} (${variable.control.unit})`
            : variable.control.label;

          folder
            .addBinding(values, /** @type {keyof CSSValues} */ (key), {
              min: variable.control.min,
              max: variable.control.max,
              step: variable.control.step,
              label,
            })
            .on('change', (ev) => {
              let cssValue;

              if (
                variable.type === 'spacing' &&
                variable.control.convertFromRem
              ) {
                // Convert px to rem
                cssValue = `${Number(ev.value) / 16}rem`;
              } else {
                // Append unit if it exists, otherwise just the value
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
    })
    .catch((error) => {
      throw new Error(
        `Failed to load Tweakpane for InstantSearch.css DevTools: ${error.message}`
      );
    });
}
