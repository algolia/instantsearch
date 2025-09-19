import React, { useEffect, useRef } from 'react';
import { Pane } from 'tweakpane';

type Theme = 'auto' | 'light' | 'dark';

interface CSSVariables {
  // Theme
  theme: Theme;

  // Colors
  textColor: string;
  textColorAlpha: number;
  primaryColor: string;
  primaryColorAlpha: number;
  mutedColor: string;
  mutedColorAlpha: number;
  buttonTextColor: string;
  buttonTextColorAlpha: number;
  borderColor: string;
  borderColorAlpha: number;
  backgroundColor: string;
  backgroundColorAlpha: number;
  shadowColor: string;

  // Size and spacing
  spacing: number;

  // Border radius
  borderRadiusSm: number;
  borderRadiusMd: number;
  borderRadiusLg: number;
  borderRadiusFull: number;

  // Transitions
  transitionDuration: number;

  // Z-index
  zIndexChat: number;

  // Chat component
  chatWidth: number;
  chatHeight: number;
  chatMaximizedWidth: number;
  chatMaximizedHeight: number;
  chatMargin: number;
}

// Utility function to get CSS variable value
function getCSSVariableValue(property: string, fallback: string = '') {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim() || fallback
  );
}

// Utility function to convert RGB string to hex
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

// Utility function to parse numeric values from CSS
function parseNumericValue(cssValue: string) {
  const match = cssValue.match(/^(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

// Function to get current theme from data attribute
function getCurrentTheme() {
  const theme = document.documentElement.getAttribute('data-theme');
  return (theme as Theme) || 'auto';
}

// Function to apply theme
function applyTheme(theme: Theme) {
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// Function to export current CSS variables
function exportCSSVariables(): string {
  const values = getDefaultValues();
  const { r: textR, g: textG, b: textB } = hexToRgb(values.textColor);
  const {
    r: primaryR,
    g: primaryG,
    b: primaryB,
  } = hexToRgb(values.primaryColor);
  const { r: mutedR, g: mutedG, b: mutedB } = hexToRgb(values.mutedColor);
  const {
    r: buttonTextR,
    g: buttonTextG,
    b: buttonTextB,
  } = hexToRgb(values.buttonTextColor);
  const { r: borderR, g: borderG, b: borderB } = hexToRgb(values.borderColor);
  const {
    r: backgroundR,
    g: backgroundG,
    b: backgroundB,
  } = hexToRgb(values.backgroundColor);
  const { r: shadowR, g: shadowG, b: shadowB } = hexToRgb(values.shadowColor);

  return `// CSS Variables
:root {
  /* Text colors */
  --ais-text-color-rgb: ${textR}, ${textG}, ${textB};
  --ais-text-color-alpha: ${values.textColorAlpha};
  --ais-primary-color-rgb: ${primaryR}, ${primaryG}, ${primaryB};
  --ais-primary-color-alpha: ${values.primaryColorAlpha};
  --ais-muted-color-rgb: ${mutedR}, ${mutedG}, ${mutedB};
  --ais-muted-color-alpha: ${values.mutedColorAlpha};
  --ais-button-text-color-rgb: ${buttonTextR}, ${buttonTextG}, ${buttonTextB};
  --ais-button-text-color-alpha: ${values.buttonTextColorAlpha};

  /* Border color */
  --ais-border-color-rgb: ${borderR}, ${borderG}, ${borderB};
  --ais-border-color-alpha: ${values.borderColorAlpha};

  /* Background color */
  --ais-background-color-rgb: ${backgroundR}, ${backgroundG}, ${backgroundB};
  --ais-background-color-alpha: ${values.backgroundColorAlpha};

  /* Shadow color */
  --ais-shadow-color-rgb: ${shadowR}, ${shadowG}, ${shadowB};

  /* Size and spacing */
  --ais-spacing: ${values.spacing / 16}rem;

  /* Border radius */
  --ais-border-radius-sm: ${values.borderRadiusSm}px;
  --ais-border-radius-md: ${values.borderRadiusMd}px;
  --ais-border-radius-lg: ${values.borderRadiusLg}px;
  --ais-border-radius-full: ${values.borderRadiusFull}px;

  /* Transitions */
  --ais-transition-duration: ${values.transitionDuration}s;

  /* Z-index layers */
  --ais-z-index-chat: ${values.zIndexChat};

  /* Chat component */
  --ais-chat-width: ${values.chatWidth}rem;
  --ais-chat-height: ${values.chatHeight}%;
  --ais-chat-maximized-width: ${values.chatMaximizedWidth}%;
  --ais-chat-maximized-height: ${values.chatMaximizedHeight}%;
  --ais-chat-margin: ${values.chatMargin}rem;
}`;
}

// Function to get default values from CSS variables
function getDefaultValues(): CSSVariables {
  return {
    // Theme
    theme: getCurrentTheme(),

    // Colors - convert from RGB format to hex
    textColor: rgbToHex(getCSSVariableValue('--ais-text-color-rgb')),
    textColorAlpha: parseFloat(getCSSVariableValue('--ais-text-color-alpha')),
    primaryColor: rgbToHex(getCSSVariableValue('--ais-primary-color-rgb')),
    primaryColorAlpha: parseFloat(
      getCSSVariableValue('--ais-primary-color-alpha')
    ),
    mutedColor: rgbToHex(getCSSVariableValue('--ais-muted-color-rgb')),
    mutedColorAlpha: parseFloat(getCSSVariableValue('--ais-muted-color-alpha')),
    buttonTextColor: rgbToHex(
      getCSSVariableValue('--ais-button-text-color-rgb')
    ),
    buttonTextColorAlpha: parseFloat(
      getCSSVariableValue('--ais-button-text-color-alpha')
    ),
    borderColor: rgbToHex(getCSSVariableValue('--ais-border-color-rgb')),
    borderColorAlpha: parseFloat(
      getCSSVariableValue('--ais-border-color-alpha')
    ),
    backgroundColor: rgbToHex(
      getCSSVariableValue('--ais-background-color-rgb')
    ),
    backgroundColorAlpha: parseFloat(
      getCSSVariableValue('--ais-background-color-alpha')
    ),
    shadowColor: rgbToHex(getCSSVariableValue('--ais-shadow-color-rgb')),

    // Size and spacing - convert rem to px (1rem = 16px)
    spacing: parseNumericValue(getCSSVariableValue('--ais-spacing')) * 16,

    // Border radius - parse px values
    borderRadiusSm: parseNumericValue(
      getCSSVariableValue('--ais-border-radius-sm')
    ),
    borderRadiusMd: parseNumericValue(
      getCSSVariableValue('--ais-border-radius-md')
    ),
    borderRadiusLg: parseNumericValue(
      getCSSVariableValue('--ais-border-radius-lg')
    ),
    borderRadiusFull: parseNumericValue(
      getCSSVariableValue('--ais-border-radius-full')
    ),

    // Transitions - parse duration
    transitionDuration: parseNumericValue(
      getCSSVariableValue('--ais-transition-duration')
    ),

    // Z-index
    zIndexChat: parseInt(getCSSVariableValue('--ais-z-index-chat'), 10),

    // Chat component - parse various units
    chatWidth: parseNumericValue(getCSSVariableValue('--ais-chat-width')),
    chatHeight: parseNumericValue(getCSSVariableValue('--ais-chat-height')),
    chatMaximizedWidth: parseNumericValue(
      getCSSVariableValue('--ais-chat-maximized-width')
    ),
    chatMaximizedHeight: parseNumericValue(
      getCSSVariableValue('--ais-chat-maximized-height')
    ),
    chatMargin: parseNumericValue(getCSSVariableValue('--ais-chat-margin')),
  };
}

// Utility function to convert hex color to RGB values
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

// Utility function to update CSS variable
function updateCSSVariable(property: string, value: string | number) {
  document.documentElement.style.setProperty(property, String(value));
}

// Utility function to update color CSS variables
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

export function TweakpaneController() {
  const paneRef = useRef<Pane | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const pane = new Pane({
      container: containerRef.current,
      title: 'InstantSearch CSS Variables',
      expanded: false,
    });

    paneRef.current = pane;

    const values = getDefaultValues();

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

        const newValues = getDefaultValues();

        // Update values object - events will be bypassed due to flag
        values.textColor = newValues.textColor;
        values.primaryColor = newValues.primaryColor;
        values.mutedColor = newValues.mutedColor;
        values.buttonTextColor = newValues.buttonTextColor;
        values.borderColor = newValues.borderColor;
        values.backgroundColor = newValues.backgroundColor;
        values.shadowColor = newValues.shadowColor;

        // Refresh pane to show updated values
        pane.refresh();

        // Reset flag
        isUpdatingTheme = false;
      });

    // Text Colors
    const textColorsFolder = pane.addFolder({ title: 'Text Colors' });

    textColorsFolder
      .addBinding(values, 'textColor', { label: 'Text Color' })
      .on('change', (ev) => {
        if (isUpdatingTheme) return;
        updateColorVariable(
          ev.value,
          '--ais-text-color-rgb',
          '--ais-text-color-alpha',
          values.textColorAlpha
        );
      });

    textColorsFolder
      .addBinding(values, 'textColorAlpha', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Text Alpha',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-text-color-alpha', ev.value)
      );

    textColorsFolder
      .addBinding(values, 'primaryColor', { label: 'Primary Color' })
      .on('change', (ev) => {
        if (isUpdatingTheme) return;
        updateColorVariable(
          ev.value,
          '--ais-primary-color-rgb',
          '--ais-primary-color-alpha',
          values.primaryColorAlpha
        );
      });

    textColorsFolder
      .addBinding(values, 'primaryColorAlpha', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Primary Alpha',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-primary-color-alpha', ev.value)
      );

    textColorsFolder
      .addBinding(values, 'mutedColor', { label: 'Muted Color' })
      .on('change', (ev) => {
        if (isUpdatingTheme) return;
        updateColorVariable(
          ev.value,
          '--ais-muted-color-rgb',
          '--ais-muted-color-alpha',
          values.mutedColorAlpha
        );
      });

    textColorsFolder
      .addBinding(values, 'mutedColorAlpha', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Muted Alpha',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-muted-color-alpha', ev.value)
      );

    textColorsFolder
      .addBinding(values, 'buttonTextColor', { label: 'Button Text Color' })
      .on('change', (ev) => {
        if (isUpdatingTheme) return;
        updateColorVariable(
          ev.value,
          '--ais-button-text-color-rgb',
          '--ais-button-text-color-alpha',
          values.buttonTextColorAlpha
        );
      });

    textColorsFolder
      .addBinding(values, 'buttonTextColorAlpha', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Button Text Alpha',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-button-text-color-alpha', ev.value)
      );

    // Border & Background Colors
    const borderColorFolder = pane.addFolder({ title: 'Border & Background' });

    borderColorFolder
      .addBinding(values, 'borderColor', { label: 'Border Color' })
      .on('change', (ev) => {
        if (isUpdatingTheme) return;
        updateColorVariable(
          ev.value,
          '--ais-border-color-rgb',
          '--ais-border-color-alpha',
          values.borderColorAlpha
        );
      });

    borderColorFolder
      .addBinding(values, 'borderColorAlpha', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Border Alpha',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-border-color-alpha', ev.value)
      );

    borderColorFolder
      .addBinding(values, 'backgroundColor', { label: 'Background Color' })
      .on('change', (ev) => {
        if (isUpdatingTheme) return;
        updateColorVariable(
          ev.value,
          '--ais-background-color-rgb',
          '--ais-background-color-alpha',
          values.backgroundColorAlpha
        );
      });

    borderColorFolder
      .addBinding(values, 'backgroundColorAlpha', {
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Background Alpha',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-background-color-alpha', ev.value)
      );

    borderColorFolder
      .addBinding(values, 'shadowColor', { label: 'Shadow Color' })
      .on('change', (ev) => {
        if (isUpdatingTheme) return;
        updateColorVariable(ev.value, '--ais-shadow-color-rgb');
      });

    // Spacing
    const spacingFolder = pane.addFolder({ title: 'Spacing & Layout' });

    spacingFolder
      .addBinding(values, 'spacing', {
        min: 4,
        max: 32,
        step: 1,
        label: 'Base Spacing (px)',
      })
      .on('change', (ev) => {
        updateCSSVariable('--ais-spacing', `${ev.value}px`);
        // Update chat margin which is calculated based on spacing
        const margin = Math.round(ev.value * 1.5);
        values.chatMargin = margin;
        updateCSSVariable('--ais-chat-margin', `${margin}px`);
        pane.refresh();
      });

    // Border Radius
    const borderRadiusFolder = pane.addFolder({ title: 'Border Radius' });

    borderRadiusFolder
      .addBinding(values, 'borderRadiusSm', {
        min: 0,
        max: 20,
        step: 1,
        label: 'Small (px)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-border-radius-sm', `${ev.value}px`)
      );

    borderRadiusFolder
      .addBinding(values, 'borderRadiusMd', {
        min: 0,
        max: 30,
        step: 1,
        label: 'Medium (px)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-border-radius-md', `${ev.value}px`)
      );

    borderRadiusFolder
      .addBinding(values, 'borderRadiusLg', {
        min: 0,
        max: 50,
        step: 1,
        label: 'Large (px)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-border-radius-lg', `${ev.value}px`)
      );

    borderRadiusFolder
      .addBinding(values, 'borderRadiusFull', {
        min: 0,
        max: 9999,
        step: 10,
        label: 'Full (px)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-border-radius-full', `${ev.value}px`)
      );

    // Transitions
    const transitionFolder = pane.addFolder({ title: 'Transitions' });

    transitionFolder
      .addBinding(values, 'transitionDuration', {
        min: 0.1,
        max: 2,
        step: 0.1,
        label: 'Duration (s)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-transition-duration', `${ev.value}s`)
      );

    // Z-index
    const zIndexFolder = pane.addFolder({ title: 'Z-index' });

    zIndexFolder
      .addBinding(values, 'zIndexChat', {
        min: 1,
        max: 10000,
        step: 1,
        label: 'Chat Z-index',
      })
      .on('change', (ev) => updateCSSVariable('--ais-z-index-chat', ev.value));

    // Chat Component
    const chatFolder = pane.addFolder({ title: 'Chat Component' });

    chatFolder
      .addBinding(values, 'chatWidth', {
        min: 10,
        max: 50,
        step: 0.5,
        label: 'Width (rem)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-chat-width', `${ev.value}rem`)
      );

    chatFolder
      .addBinding(values, 'chatHeight', {
        min: 30,
        max: 100,
        step: 5,
        label: 'Height (%)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-chat-height', `${ev.value}%`)
      );

    chatFolder
      .addBinding(values, 'chatMaximizedWidth', {
        min: 50,
        max: 100,
        step: 5,
        label: 'Maximized Width (%)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-chat-maximized-width', `${ev.value}%`)
      );

    chatFolder
      .addBinding(values, 'chatMaximizedHeight', {
        min: 80,
        max: 100,
        step: 5,
        label: 'Maximized Height (%)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-chat-maximized-height', `${ev.value}%`)
      );

    chatFolder
      .addBinding(values, 'chatMargin', {
        min: 0,
        max: 5,
        step: 0.1,
        label: 'Margin (rem)',
      })
      .on('change', (ev) =>
        updateCSSVariable('--ais-chat-margin', `${ev.value}rem`)
      );

    // Export functionality
    const exportFolder = pane.addFolder({ title: 'Export' });

    exportFolder.addButton({ title: 'Copy to clipboard' }).on('click', () => {
      const cssVariables = exportCSSVariables();
      navigator.clipboard
        .writeText(cssVariables)
        .then(() => {
          // eslint-disable-next-line no-console
          console.log('CSS variables copied to clipboard!');
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Failed to copy CSS variables:', err);
          // Fallback: show in console for manual copying
          // eslint-disable-next-line no-console
          console.log('CSS Variables:\n', cssVariables);
        });
    });

    return () => {
      pane.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: '1.5rem',
        zIndex: 1000,
      }}
    />
  );
}
