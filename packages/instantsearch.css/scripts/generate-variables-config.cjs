/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const SCSS_FILE = path.resolve(__dirname, '../src/shared/_variables.scss');
const INDEX_FILE = path.resolve(__dirname, '../devtools/index.js');

function parseSCSSVariables() {
  const content = fs.readFileSync(SCSS_FILE, 'utf-8');

  // Extract :root block
  const rootMatch = content.match(/:root\s*\{([^}]+)\}/s);
  if (!rootMatch) {
    throw new Error('Could not find :root block in SCSS file');
  }

  // Extract dark-theme mixin to identify theme variables
  const darkThemeMatch = content.match(/@mixin dark-theme\s*\{([^}]+)\}/s);
  const darkThemeContent = darkThemeMatch ? darkThemeMatch[1] : '';

  // Parse variables from :root
  const variables = [];
  const varRegex = /--([a-z-]+):\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(rootMatch[1])) !== null) {
    const name = `--${match[1]}`;
    const value = match[2].trim();

    // Skip computed variables (containing calc, rgba, var)
    const isComputedVariable =
      value.includes('calc(') ||
      value.includes('rgba(') ||
      value.includes('var(');

    if (!isComputedVariable) {
      const isThemeVariable = darkThemeContent.includes(name);
      const config = createVariableConfig(name, value, isThemeVariable);

      if (config) {
        variables.push(config);
      }
    }
  }

  return variables;
}

function createVariableConfig(name, defaultValue, isThemeVariable) {
  const type = detectVariableType(name, defaultValue);

  if (!type) {
    return null;
  }

  const config = {
    name,
    type,
    themeVariable: isThemeVariable,
    category: detectCategory(name),
    control: createControlConfig(name, type),
  };

  return config;
}

function detectVariableType(name, value) {
  if (name.endsWith('-rgb')) return 'color-rgb';
  if (name.endsWith('-alpha')) return 'color-alpha';
  if (name === '--ais-spacing') return 'spacing';
  if (name.startsWith('--ais-border-radius-')) return 'border-radius';
  if (name === '--ais-transition-duration') return 'duration';
  if (name.startsWith('--ais-z-index-')) return 'z-index';
  if (value.endsWith('rem')) return 'dimension-rem';
  if (value.endsWith('%')) return 'dimension-percent';

  return null;
}

function detectCategory(name) {
  if (
    name.includes('text') ||
    name.includes('primary') ||
    name.includes('muted') ||
    name.includes('button-text')
  ) {
    return 'Text Colors';
  }
  // Check border-radius before border to avoid false positive
  if (name.includes('border-radius')) {
    return 'Border Radius';
  }
  if (
    name.includes('border') ||
    name.includes('background') ||
    name.includes('shadow')
  ) {
    return 'Border & Background';
  }
  if (name.includes('spacing')) {
    return 'Spacing & Layout';
  }
  if (name.includes('transition')) {
    return 'Transitions';
  }
  if (name.includes('z-index')) {
    return 'Z-index';
  }
  if (name.includes('chat')) {
    return 'Chat Component';
  }

  return 'Other';
}

function createControlConfig(name, type) {
  const control = {
    label: formatLabel(name),
  };

  switch (type) {
    case 'color-rgb':
      // Color picker will be paired with its alpha slider
      control.colorName = toCamelCase(
        name.replace('--ais-', '').replace('-rgb', '')
      );
      break;

    case 'color-alpha':
      control.min = 0;
      control.max = 1;
      control.step = 0.01;
      break;

    case 'spacing':
      control.min = 4;
      control.max = 32;
      control.step = 1;
      control.unit = 'px';
      control.convertFromRem = true;
      break;

    case 'border-radius':
      if (name.includes('full')) {
        control.min = 0;
        control.max = 9999;
        control.step = 10;
      } else if (name.includes('sm')) {
        control.min = 0;
        control.max = 20;
        control.step = 1;
      } else if (name.includes('md')) {
        control.min = 0;
        control.max = 30;
        control.step = 1;
      } else if (name.includes('lg')) {
        control.min = 0;
        control.max = 50;
        control.step = 1;
      }
      control.unit = 'px';
      break;

    case 'duration':
      control.min = 0.1;
      control.max = 2;
      control.step = 0.1;
      control.unit = 's';
      break;

    case 'z-index':
      control.min = 1;
      control.max = 10000;
      control.step = 1;
      break;

    case 'dimension-rem':
      if (name.includes('width')) {
        control.min = 10;
        control.max = 50;
        control.step = 0.5;
      } else if (name.includes('margin')) {
        control.min = 0;
        control.max = 5;
        control.step = 0.1;
      }
      control.unit = 'rem';
      break;

    case 'dimension-percent':
      if (name.includes('maximized-width')) {
        control.min = 50;
        control.max = 100;
        control.step = 5;
      } else if (name.includes('maximized-height')) {
        control.min = 80;
        control.max = 100;
        control.step = 5;
      } else if (name.includes('height')) {
        control.min = 30;
        control.max = 100;
        control.step = 5;
      }
      control.unit = '%';
      break;

    default:
      break;
  }

  return control;
}

function formatLabel(name) {
  return name
    .replace('--ais-', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function main() {
  console.log('Parsing SCSS variables from:', SCSS_FILE);

  const variables = parseSCSSVariables();

  console.log(`Found ${variables.length} configurable variables`);

  const config = {
    variables,
  };

  const configString = `const variablesConfig = ${JSON.stringify(
    config,
    null,
    2
  )};`;

  let indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');
  indexContent = indexContent.replace(
    /const variablesConfig = \{[\s\S]*?\};/,
    configString
  );

  fs.writeFileSync(INDEX_FILE, indexContent, 'utf-8');

  const { execSync } = require('child_process');
  try {
    execSync(`npx prettier --write ${INDEX_FILE}`, { stdio: 'inherit' });
  } catch (error) {
    console.warn('Warning: Failed to run prettier');
  }

  console.log('Updated config in:', INDEX_FILE);
  console.log('\nVariables by category:');

  const byCategory = variables.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = 0;
    acc[v.category]++;
    return acc;
  }, {});

  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
}

main();
